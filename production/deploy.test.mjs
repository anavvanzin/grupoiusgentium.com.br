import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, rm, symlink, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { deploy, prepare } from './deploy.mjs';
import { loadAssets, sha256, cssReferences, allowedPath } from './assets.mjs';
import app from './worker.generated.mjs';

const sha='a'.repeat(40);
const token='mock-api-token-DO-NOT-LOG';
const uploadJwt='mock-upload-jwt-DO-NOT-LOG';
const completionJwt='mock-completion-jwt-DO-NOT-LOG';
const oldVersion='68fdf213-c1f7-4f87-8257-0d4f3ef51d81';
const newVersion='12345678-1234-4abc-8abc-123456789abc';
const beforeId='original-deployment';
const afterId='verified-deployment';
const apiPrefix='/client/v4/accounts/06e1749b0b658c7dd17dd9807bbd5b97';
const worker='/workers/scripts/ius-gentium';
const json=x=>new Response(JSON.stringify(x),{headers:{'Content-Type':'application/json'}});
const result=x=>json({success:true,result:x});
function runtime() {
  return {resources:{bindings:[{name:'ASSETS',type:'assets'}],script_runtime:{
    compatibility_date:'2026-08-08',usage_model:'standard',assets:{
      raw_run_worker_first:true,html_handling:'none',not_found_handling:'none',
      serve_directly:false,base_path:'/'}}}};
}
async function fixture(options={}) {
  const prepared=await prepare();
  const hashes=[...new Set([...prepared.assets.values()].map(a=>a.hash))];
  const byHash=new Map([...prepared.assets.values()].map(a=>[a.hash,a]));
  const buckets=options.buckets??[hashes.slice(0,2),hashes.slice(2)];
  const state={writes:[],logs:[],publicHosts:new Set(),githubReads:0,currentReads:0,uploads:0,promoted:false};
  const env={WORKERS_CI_BRANCH:'main',WORKERS_CI_COMMIT_SHA:sha,CLOUDFLARE_API_TOKEN:token,...options.env};
  const request=async (input,init={})=>{
    const url=new URL(input);
    const method=init.method||'GET';
    if(url.hostname==='api.github.com') {
      state.githubReads++;
      const stale=options.staleAt===state.githubReads;
      return json({commit:{sha:stale?'b'.repeat(40):sha}});
    }
    if(url.hostname==='api.cloudflare.com') {
      const path=url.pathname.slice(apiPrefix.length);
      assert.ok(url.pathname.startsWith(apiPrefix),'Account target must remain scoped');
      if(method!=='GET') {
        state.writes.push({method,path});
        if(options.failPath===path) {
          if(options.failure==='uncertain') throw new Error('Uncertain network failure '+token+' '+uploadJwt);
          if(options.failure==='invalid-json') return new Response('not JSON '+token);
          return new Response(JSON.stringify({success:false,errors:[{message:token+' '+uploadJwt}]}),{status:403,headers:{'Content-Type':'application/json'}});
        }
      }
      assert.equal(init.redirect,'error');
      if(path!=='/workers/assets/upload') assert.equal(init.headers.Authorization,'Bearer '+token);
      if(path===worker+'/deployments'&&method==='GET') {
        state.currentReads++;
        const changed=options.raceAt===state.currentReads;
        const versions=[{version_id:state.promoted?newVersion:oldVersion,percentage:options.baselinePercentage??100}];
        if(options.split&&!state.promoted) versions.push({version_id:'other',percentage:0});
        return result({deployments:[{id:changed?'concurrent-deployment':state.promoted?afterId:beforeId,versions}]});
      }
      if(path===worker+'/versions/'+oldVersion||path===worker+'/versions/'+newVersion) {
        const r=runtime();
        if(path.endsWith(oldVersion)) options.baselineRuntime?.(r);
        else options.candidateRuntime?.(r);
        return result(r);
      }
      if(path===worker+'/subdomain') return result({previews_enabled:options.previewEnabled??true});
      if(path==='/workers/subdomain') return result({subdomain:'mock-account'});
      if(path===worker+'/assets-upload-session') {
        const payload=JSON.parse(init.body);
        assert.deepEqual(Object.keys(payload),['manifest']);
        assert.equal(Object.keys(payload.manifest).length,31);
        for(const [path,a] of prepared.assets) assert.deepEqual(payload.manifest[path],{hash:a.hash,size:a.size});
        return result({jwt:uploadJwt,buckets});
      }
      if(path==='/workers/assets/upload') {
        assert.equal(url.search,'?base64=true');
        assert.equal(init.headers.Authorization,'Bearer '+uploadJwt);
        const expected=buckets[state.uploads];
        assert.deepEqual([...init.body.keys()],expected);
        for(const [hash,file] of init.body) {
          const a=byHash.get(hash);
          assert.equal(file.name,hash,'Multipart filename is the hash');
          assert.equal(file.type,a.contentType,'Multipart MIME is the public MIME');
          assert.equal(await file.text(),a.bytes.toString('base64'),'Multipart bytes are base64 of original bytes');
        }
        state.uploads++;
        return result((!options.noCompletion&&state.uploads===buckets.length)||(options.earlyCompletion&&state.uploads===1)?{jwt:completionJwt}:{});
      }
      if(path===worker+'/versions'&&method==='POST') {
        const names=[...init.body.keys()];
        assert.deepEqual(names,['metadata','worker.generated.mjs','event.mjs','media.generated.mjs']);
        const metadata=JSON.parse(await init.body.get('metadata').text());
        assert.equal(metadata.keep_assets,undefined,'Never inherit last-upload assets');
        assert.equal(metadata.assets.jwt,buckets.length?completionJwt:uploadJwt);
        assert.deepEqual(metadata.assets.config,{html_handling:'none',not_found_handling:'none',run_worker_first:true});
        assert.deepEqual(metadata.bindings,[{name:'ASSETS',type:'assets'}]);
        assert.equal(metadata.annotations['workers/commit_sha'],sha);
        for(const {name,bytes} of prepared.modules) assert.equal(sha256(Buffer.from(await init.body.get(name).arrayBuffer())),sha256(bytes));
        return result({id:newVersion});
      }
      if(path===worker+'/deployments'&&method==='POST') {
        assert.deepEqual(JSON.parse(init.body).versions,[{version_id:newVersion,percentage:100}]);
        assert.ok(state.publicHosts.has('12345678-ius-gentium.mock-account.workers.dev'),'Must verify preview before promotion');
        state.promoted=true;
        return result({id:afterId});
      }
      throw new Error('Unexpected mock API request '+method+' '+path);
    }
    assert.equal(init.redirect,'error');
    state.publicHosts.add(url.hostname);
    const isPreview=url.hostname.endsWith('.workers.dev');
    const isWWW=url.hostname==='www.grupoiusgentium.com.br';
    const override=await options.publicResponse?.({url,isPreview,isWWW});
    if(override) return override;
    return app.request(url.href,{}, {ASSETS:{fetch:async request=>{
      const path=new URL(request.url).pathname;
      const a=prepared.assets.get(path);
      return a?new Response(a.bytes,{headers:{'Content-Type':a.contentType}}):new Response('Missing',{status:404});
    }}});
  };
  state.run=()=>deploy({env,prepared,request,log:x=>state.logs.push(x)});
  state.assertNoPromotion=()=>assert.equal(state.writes.filter(x=>x.path===worker+'/deployments').length,0);
  state.assertNoSecrets=error=>{
    const text=state.logs.join('\n')+'\n'+(error?.message||'');
    for(const secret of [token,uploadJwt,completionJwt]) assert.ok(!text.includes(secret),'Logs/error must redact authorization values');
  };
  return state;
}
async function blocked(options,pattern,{writes=undefined}={}) {
  const state=await fixture(options);
  let error;
  try {await state.run();} catch(e) {error=e;}
  assert.ok(error,'Expected deployment to be blocked');
  assert.match(error.message,pattern);
  state.assertNoPromotion();
  state.assertNoSecrets(error);
  if(writes!==undefined) assert.equal(state.writes.length,writes);
  return state;
}

test('prepare validates exact 31-file snapshot and does not contain credentials',async()=>{
  const p=await prepare();
  assert.equal(p.assets.size,31);
  assert.equal([...p.assets.values()].reduce((n,a)=>n+a.bytes.length,0),136205);
  assert.equal(p.modules.length,3);
  assert.equal(p.embedded.size,3);
  assert.equal(p.metadata.keep_assets,undefined);
  assert.equal(p.metadata.assets.jwt,undefined);
});

test('multi-bucket upload preserves base64 bytes, MIME, filenames and preview before 100% promotion',async()=>{
  const state=await fixture();
  assert.deepEqual(await state.run(),{version:newVersion,deployment:afterId,assetCount:31});
  assert.equal(state.uploads,2);
  assert.equal(state.writes.length,5);
  assert.ok(state.publicHosts.has('grupoiusgentium.com.br'));
  assert.ok(state.publicHosts.has('www.grupoiusgentium.com.br'));
  state.assertNoSecrets();
});

test('empty buckets reuse session completion token with no asset upload',async()=>{
  const state=await fixture({buckets:[]});
  await state.run();
  assert.equal(state.uploads,0);
  assert.equal(state.writes.length,3);
  state.assertNoSecrets();
});

test('branch and complete commit identity are required before network writes',async()=>{
  await blocked({env:{WORKERS_CI_BRANCH:'preview'}},/restricted/,{writes:0});
  await blocked({env:{WORKERS_CI_COMMIT_SHA:'123'}},/full Workers Builds commit/,{writes:0});
});
test('stale main blocks before uploading',()=>blocked({staleAt:1},/Stale build/,{writes:0}));
test('main changing during preview blocks promotion',()=>blocked({staleAt:3},/Stale build/));
test('disabled previews block writes without changing settings',()=>blocked({previewEnabled:false},/Preview URLs disabled/,{writes:0}));
test('baseline bindings must be exactly ASSETS',()=>blocked({baselineRuntime:r=>r.resources.bindings.push({type:'plain_text',name:'UNEXPECTED',text:token})},/Unexpected bindings/,{writes:0}));
test('candidate runtime and bindings are fully checked before preview/promotion',async()=>{
  await blocked({candidateRuntime:r=>r.resources.bindings.push({type:'plain_text',name:'UNEXPECTED',text:token})},/Unexpected bindings/);
  await blocked({candidateRuntime:r=>r.resources.script_runtime.compatibility_flags=['nodejs_compat']},/Unexpected runtime flags/);
  await blocked({candidateRuntime:r=>r.resources.script_runtime.assets.unknown='setting'},/Unexpected assets runtime settings/);
});
test('assets-only and changed routing baselines block uploads',async()=>{
  await blocked({baselineRuntime:r=>r.resources.script_runtime.assets.raw_run_worker_first=false},/assets-only/,{writes:0});
  await blocked({baselineRuntime:r=>r.resources.script_runtime.assets.html_handling='auto-trailing-slash'},/HTML handling/,{writes:0});
});
test('split or partial production deployments are rejected',async()=>{
  await blocked({split:true},/Split deployment/,{writes:0});
  await blocked({baselinePercentage:99},/100 percent/,{writes:0});
});
test('wrong MIME from production blocks all writes',()=>blocked({publicResponse:({url,isPreview})=>!isPreview&&url.pathname==='/site.css'?new Response('body{}',{headers:{'Content-Type':'text/html'}}):undefined},/Wrong asset type/,{writes:0}));
test('preview returning HTML under the correct CSS type is blocked',()=>blocked({publicResponse:({url,isPreview})=>isPreview&&url.pathname==='/site.css'?new Response('<!doctype html><html>wrong</html>',{headers:{'Content-Type':'text/css'}}):undefined},/HTML returned as an asset/));
test('preview asset byte mismatch blocks promotion',()=>blocked({publicResponse:({url,isPreview})=>isPreview&&url.pathname==='/site.js'?new Response('console.log("corrupt")',{headers:{'Content-Type':'text/javascript'}}):undefined},/Asset bytes changed/));
test('preview event page cannot be a generic 200 fallback',()=>blocked({publicResponse:({url,isPreview})=>isPreview&&url.pathname==='/arquivo/saberes-franca-brasil-2026'?new Response('<html>generic</html>',{headers:{'Content-Type':'text/html'}}):undefined},/Page content missing/));
test('production changing before upload or after preview blocks the writer',async()=>{
  await blocked({raceAt:2},/Production changed/,{writes:0});
  await blocked({raceAt:3},/Production changed/);
});
test('unknown or duplicate hash requested by server is rejected before upload',async()=>{
  await blocked({buckets:[['unknown-hash']]},/unknown asset hash/,{writes:1});
  const p=await prepare();const hash=[...p.assets.values()][0].hash;
  await blocked({buckets:[[hash],[hash]]},/Duplicate upload hash/,{writes:1});
});
test('upload without completion JWT cannot create a version',async()=>{
  for(const earlyCompletion of [false,true]) {
    const state=await blocked({noCompletion:true,earlyCompletion},/No completion authorization/);
    assert.equal(state.writes.some(x=>x.path===worker+'/versions'),false);
  }
});
test('API denial during session or upload is never retried and logs no credentials',async()=>{
  for(const failPath of [worker+'/assets-upload-session','/workers/assets/upload']) {
    const state=await blocked({failPath},/HTTP 403/);
    assert.equal(state.writes.filter(x=>x.path===failPath).length,1);
  }
});
test('uncertain version upload is invoked once and never promoted',async()=>{
  const failPath=worker+'/versions';
  const state=await blocked({failPath,failure:'uncertain'},/uncertain result/);
  assert.equal(state.writes.filter(x=>x.path===failPath).length,1);
});
test('uncertain promotion is invoked once without automatic rollback or retry',async()=>{
  const state=await fixture({failPath:worker+'/deployments',failure:'uncertain'});
  let error;
  try {await state.run();} catch(e) {error=e;}
  assert.match(error.message,/uncertain result/);
  assert.equal(state.writes.filter(x=>x.path===worker+'/deployments').length,1);
  state.assertNoSecrets(error);
});
test('public repository sources block promotion even if returned with status 200',()=>blocked({publicResponse:({url,isPreview})=>isPreview&&url.pathname==='/.git/HEAD'?new Response('ref: refs/heads/main'):undefined},/Repository source is public/));
test('allowlist rejects traversal and CSS collects relative dependencies',()=>{
  for(const path of ['/production/baseline.mjs','/semestre-2026-2/../baseline.svg','/semestre-2026-2/.git.svg']) assert.equal(allowedPath(path),false);
  assert.deepEqual(cssReferences('a{background:url(./semestre-2026-2/desktop-crosshair.svg)} b{mask:url(data:image/svg+xml;base64,eA==)}','/site.css'),['/semestre-2026-2/desktop-crosshair.svg']);
  assert.throws(()=>cssReferences('a{background:url(/production/baseline.mjs)}','/site.css'),/outside allowlist/);
});
test('snapshot corruption, missing file, unlisted file and symlink are rejected',async()=>{
  for(const kind of ['corrupt','missing','unlisted','symlink','directory-symlink']) {
    const dir=await mkdtemp(tmpdir()+'/ius-assets-test-');
    try {
      await cp(new URL('./public-assets/',import.meta.url),dir+'/public-assets',{recursive:true});
      await cp(new URL('./assets-manifest.json',import.meta.url),dir+'/assets-manifest.json');
      if(kind==='corrupt') await writeFile(dir+'/public-assets/site.css','body { color: red; }');
      if(kind==='missing') await rm(dir+'/public-assets/site.css');
      if(kind==='unlisted') await writeFile(dir+'/public-assets/unlisted.css','body{}');
      if(kind==='symlink') {await rm(dir+'/public-assets/site.css');await symlink(dir+'/public-assets/semestre-2026-2.css',dir+'/public-assets/site.css');}
      if(kind==='directory-symlink') {await rename(dir+'/public-assets',dir+'/real-assets');await symlink(dir+'/real-assets',dir+'/public-assets');}
      await assert.rejects(loadAssets(pathToFileURL(dir+'/')));
    } finally {await rm(dir,{recursive:true,force:true});}
  }
});

// A failed readback is reported after promotion; it must not trigger another writer.
test('post-promotion public WWW failure is detected without retry or automatic rollback',async()=>{
  const state=await fixture({publicResponse:({url,isWWW})=>isWWW&&url.pathname==='/site.js'?new Response('changed',{headers:{'Content-Type':'text/javascript'}}):undefined});
  let error;
  try {await state.run();} catch(e) {error=e;}
  assert.match(error.message,/Asset bytes changed/);
  assert.equal(state.promoted,true);
  assert.equal(state.writes.filter(x=>x.path===worker+'/deployments').length,1);
  state.assertNoSecrets(error);
});
