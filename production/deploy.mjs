// https://developers.cloudflare.com/workers/static-assets/direct-upload/
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadAssets, sha256, checkBytes, verifyInventory } from './assets.mjs';

const account = '06e1749b0b658c7dd17dd9807bbd5b97';
const worker = 'ius-gentium';
const root = new URL('./', import.meta.url);
const apiRoot = 'https://api.cloudflare.com/client/v4/accounts/' + account;
const workerPath = '/workers/scripts/' + worker;
const origin = 'https://grupoiusgentium.com.br';
const files = ['worker.generated.mjs', 'event.mjs', 'media.generated.mjs'];
const eventPath = '/arquivo/saberes-franca-brasil-2026';
const assetConfig = {html_handling:'none',not_found_handling:'none',run_worker_first:true};
const pageMarkers = new Map([['/',eventPath],[eventPath,'Cristiane Derani'],
  ['/anuncios',eventPath],['/arquivo',eventPath],['/semestre-2026-2','Doutrinas militares'],
  ['/coordenador','Arno Dal Ri']]);
const eventAssets = ['/saberes-franca-brasil-2026/event.css',
  '/saberes-franca-brasil-2026/cartaz-final.webp','/saberes-franca-brasil-2026/inscricoes.webp'];
const sourcePaths = ['/.git/HEAD','/production/baseline.mjs','/production/assets-manifest.json'];

export function checkRuntime(version) {
  const {bindings,script_runtime:r} = version.resources;
  assert.ok(Array.isArray(bindings)&&bindings.length===1&&bindings[0].name==='ASSETS'&&bindings[0].type==='assets'&&
    Object.keys(bindings[0]).every(k=>['name','type'].includes(k)),'Unexpected bindings require review');
  assert.equal(r.compatibility_date,'2026-08-08','Unexpected runtime date');
  assert.deepEqual(r.compatibility_flags||[],[],'Unexpected runtime flags');
  assert.equal(r.usage_model,'standard','Unexpected usage model');
  assert.ok(Object.keys(r).every(k=>['assets','compatibility_date','compatibility_flags','usage_model'].includes(k)),'Unexpected runtime settings');
  assert.equal(r.assets.raw_run_worker_first,true,'Refuse an assets-only version');
  assert.equal(r.assets.html_handling,'none','Unexpected HTML handling');
  assert.equal(r.assets.not_found_handling,'none','Unexpected missing-asset handling');
  assert.equal(r.assets.serve_directly,false,'Unexpected direct serving');
  assert.equal(r.assets.base_path,'/','Unexpected assets base path');
  assert.ok(Object.keys(r.assets).every(k=>['html_handling','not_found_handling','serve_directly','raw_run_worker_first','base_path'].includes(k)),'Unexpected assets runtime settings');
}

export async function prepare() {
  const modules = await Promise.all(files.map(async name=>({name,bytes:await readFile(new URL(name,root))})));
  const assets = await loadAssets();
  const {default:app} = await import('./worker.generated.mjs');
  const semesterHTML = await (await app.request(origin+'/semestre-2026-2')).text();
  verifyInventory(assets,semesterHTML);
  const embedded = new Map();
  for(const path of eventAssets) {
    const r=await app.request(origin+path);
    assert.equal(r.status,200,'Generated event asset missing');
    embedded.set(path,{bytes:Buffer.from(await r.arrayBuffer()),contentType:r.headers.get('content-type')});
  }
  return {modules,assets,embedded,metadata:{main_module:files[0],compatibility_date:'2026-08-08',
    bindings:[{name:'ASSETS',type:'assets'}],assets:{config:{...assetConfig}},
    annotations:{'workers/message':'Verified explicit public asset snapshot'}}};
}

export async function deploy({env=process.env, request=fetch, log=console.log, prepared}={}) {
  assert.equal(env.WORKERS_CI_BRANCH,'main','Production deploy is restricted to Workers Builds main');
  assert.match(env.WORKERS_CI_COMMIT_SHA||'',/^[a-f0-9]{40}$/,'A full Workers Builds commit SHA is required');
  const token=env.CLOUDFLARE_API_TOKEN;
  assert.ok(token,'Existing Workers Builds token is required; this script creates no credentials');
  const {modules,assets,embedded,metadata}=prepared||await prepare();
  metadata.annotations['workers/commit_sha']=env.WORKERS_CI_COMMIT_SHA;
  async function api(path,options={},bearer=token) {
    const method=options.method||'GET';
    let response,data;
    try {
      response=await request(apiRoot+path,{...options,redirect:'error',signal:AbortSignal.timeout(60000),
        headers:{...options.headers,Authorization:'Bearer '+bearer}});
      data=await response.json();
    } catch {
      throw new Error('Cloudflare API '+method+' '+path+' has an uncertain result; inspect before retrying');
    }
    // Never print API bodies, authorization headers, upload metadata, tokens or JWTs.
    if(!response.ok || data.success!==true || !data.result)
      throw new Error('Cloudflare API '+method+' '+path+' failed: HTTP '+response.status+'; inspect before retrying');
    return data.result;
  }
  async function publicResponse(base,path) {
    const r=await request(base+path,{redirect:'error',signal:AbortSignal.timeout(30000),cache:'no-store'});
    return {status:r.status,bytes:Buffer.from(await r.arrayBuffer()),contentType:r.headers.get('content-type')||''};
  }
  async function latestMain() {
    const r=await request('https://api.github.com/repos/anavvanzin/grupoiusgentium.com.br/branches/main',{
      redirect:'error',signal:AbortSignal.timeout(30000),headers:{Accept:'application/vnd.github+json','User-Agent':'ius-gentium-deploy'}});
    assert.equal(r.status,200,'Cannot verify latest main commit');
    assert.equal((await r.json()).commit.sha,env.WORKERS_CI_COMMIT_SHA,'Stale build: main changed');
  }
  const current=async()=>{
    const result=await api(workerPath+'/deployments?per_page=1');
    assert.ok(result.deployments?.length,'No active deployment');
    return result.deployments[0];
  };
  const sameProduction=async()=>assert.equal((await current()).id,before.id,'Production changed; refusing to overwrite');
  await latestMain();
  const before=await current();
  assert.equal(before.versions.length,1,'Split deployment requires review');
  assert.equal(before.versions[0].percentage,100,'Baseline must be at 100 percent');
  checkRuntime(await api(workerPath+'/versions/'+before.versions[0].version_id));
  assert.equal((await api(workerPath+'/subdomain')).previews_enabled,true,'Preview URLs disabled; settings are never changed by this script');
  const {subdomain}=await api('/workers/subdomain');
  assert.match(subdomain,/^[a-z0-9-]+$/,'Invalid Workers subdomain');

  async function verifyAssets(base) {
    for(const [path,a] of assets) {
      const r=await publicResponse(base,path);
      assert.equal(r.status,200,'Asset response '+path);
      checkBytes(path,r.bytes,r.contentType);
      assert.equal(sha256(r.bytes),a.sha256,'Asset bytes changed: '+path);
    }
  }
  async function verifySite(base) {
    await verifyAssets(base);
    for(const [path,marker] of pageMarkers) {
      const r=await publicResponse(base,path);
      assert.equal(r.status,200,'Page response '+path);
      assert.match(r.contentType,/^text\/html(?:;|$)/i,'Wrong page content type: '+path);
      assert.ok(r.bytes.toString().includes(marker),'Page content missing: '+path);
      if(path==='/semestre-2026-2') verifyInventory(assets,r.bytes.toString());
    }
    for(const [path,a] of embedded) {
      const r=await publicResponse(base,path);
      assert.equal(r.status,200,'Event asset '+path);
      assert.equal(r.contentType.split(';')[0],a.contentType.split(';')[0],'Event asset type '+path);
      assert.equal(sha256(r.bytes),sha256(a.bytes),'Event asset changed '+path);
    }
    const search=await publicResponse(base,'/api/archive?q=saberes&type=evento');
    assert.equal(search.status,200,'Archive search response');
    assert.match(search.contentType,/^application\/json(?:;|$)/i,'Archive search type');
    const results=JSON.parse(search.bytes.toString());
    assert.equal(results.count,1,'Event search count');
    assert.equal(results.results[0].slug,'saberes-franca-brasil-2026','Event search result');
    for(const path of sourcePaths) assert.equal((await publicResponse(base,path)).status,404,'Repository source is public: '+path);
  }
  // Compare the reviewed immutable snapshot to production before any writes.
  await verifyAssets(origin);
  await latestMain();
  await sameProduction();
  const manifest=Object.fromEntries([...assets].map(([path,a])=>[path,{hash:a.hash,size:a.size}]));
  const byHash=new Map([...assets.values()].map(a=>[a.hash,a]));
  const session=await api(workerPath+'/assets-upload-session',{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({manifest})});
  assert.ok(typeof session.jwt==='string'&&session.jwt.length>0,'Missing asset upload authorization');
  assert.ok(Array.isArray(session.buckets),'Invalid asset upload buckets');
  const requested=session.buckets.flat();
  assert.ok(session.buckets.every(b=>Array.isArray(b)&&b.length>0),'Invalid empty upload bucket');
  assert.equal(new Set(requested).size,requested.length,'Duplicate upload hash requested');
  assert.ok(requested.every(hash=>byHash.has(hash)),'Cloudflare requested an unknown asset hash');
  let completion=session.buckets.length===0?session.jwt:undefined;
  // All writes are sequential and are never automatically retried.
  for(const bucket of session.buckets) {
    const body=new FormData();
    for(const hash of bucket) {
      const a=byHash.get(hash);
      body.append(hash,new Blob([a.bytes.toString('base64')],{type:a.contentType}),hash);
    }
    const result=await api('/workers/assets/upload?base64=true',{method:'POST',body},session.jwt);
    assert.ok(!result.jwt||typeof result.jwt==='string','Invalid completion authorization');
    completion=result.jwt;
  }
  assert.ok(completion,'No completion authorization; refusing version upload');
  metadata.assets.jwt=completion;
  const body=new FormData();
  body.append('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}));
  for(const {name,bytes} of modules) body.append(name,new Blob([bytes],{type:'application/javascript+module'}),name);
  const uploaded=await api(workerPath+'/versions',{method:'POST',body});
  assert.match(uploaded.id,/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,'Invalid version id');
  log('Uploaded candidate '+uploaded.id+'; production remains '+before.id);
  checkRuntime(await api(workerPath+'/versions/'+uploaded.id));
  const preview='https://'+uploaded.id.slice(0,8)+'-'+worker+'.'+subdomain+'.workers.dev';
  await verifySite(preview);
  await latestMain();
  await sameProduction();
  const deployment=await api(workerPath+'/deployments',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({strategy:'percentage',versions:[{version_id:uploaded.id,percentage:100}],
      annotations:{'workers/message':'Verified explicit assets; previous version '+before.versions[0].version_id}})});
  log('Created deployment '+deployment.id+'; version '+uploaded.id);
  const after=await current();
  assert.equal(after.id,deployment.id,'Unexpected deployment; inspect before retrying');
  assert.deepEqual(after.versions,[{version_id:uploaded.id,percentage:100}],'Deployment readback mismatch; inspect before retrying');
  for(const host of [origin,'https://www.grupoiusgentium.com.br']) await verifySite(host);
  log('PASS: preview, '+assets.size+' retained assets, event assets, search, source exclusion, deployment readback and both public domains.');
  return {version:uploaded.id,deployment:deployment.id,assetCount:assets.size};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===fileURLToPath(pathToFileURL(process.argv[1]))) {
  (async()=>{
    const prepared=await prepare();
    if(process.argv.includes('--dry-run')) {
      console.log(JSON.stringify({metadata:prepared.metadata,modules:prepared.modules.map(({name,bytes})=>({name,size:bytes.length,sha256:sha256(bytes)})),
        assets:[...prepared.assets].map(([path,{bytes,...info}])=>({path,...info}))},null,2));
      return;
    }
    await deploy({prepared});
  })().catch(error=>{console.error(error.message);process.exitCode=1;});
}
