// Only the compiled Worker modules are uploaded; never publish the repository as assets.
// https://developers.cloudflare.com/workers/static-assets/direct-upload/
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const account = '06e1749b0b658c7dd17dd9807bbd5b97';
const worker = 'ius-gentium';
const root = new URL('./', import.meta.url);
const apiRoot = 'https://api.cloudflare.com/client/v4/accounts/' + account;
const workerPath = '/workers/scripts/' + worker;
const files = ['worker.generated.mjs', 'event.mjs', 'media.generated.mjs'];
const eventPath = '/arquivo/saberes-franca-brasil-2026';
const smokePaths = ['/', eventPath, '/anuncios', '/site.css', '/site.js',
  '/logo-48.webp', '/logo-120.webp', '/saberes-franca-brasil-2026/event.css',
  '/saberes-franca-brasil-2026/cartaz-final.webp',
  '/saberes-franca-brasil-2026/inscricoes.webp'];

export async function prepare() {
  const modules = await Promise.all(files.map(async name => ({name, bytes: await readFile(new URL(name, root))})));
  const metadata = {
    main_module: files[0], compatibility_date: '2026-08-08',
    keep_assets: true, bindings: [{name:'ASSETS',type:'assets'}],
    assets: {config:{html_handling:'none',not_found_handling:'none',run_worker_first:true}},
    annotations:{'workers/message':'Asset-preserving production pipeline'}
  };
  const sha = process.env.WORKERS_CI_COMMIT_SHA;
  if (sha && /^[a-f0-9]{40}$/.test(sha)) metadata.annotations['workers/commit_sha'] = sha;
  return {modules,metadata};
}

async function main() {
  const {modules,metadata} = await prepare();
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({metadata,modules:modules.map(({name,bytes})=>({
      name,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')
    }))},null,2));
    return;
  }
  assert.equal(process.env.WORKERS_CI_BRANCH, 'main', 'Production deploy is restricted to Workers Builds main');
  const token = process.env.CLOUDFLARE_API_TOKEN;
  assert.ok(token, 'Existing Workers Builds CLOUDFLARE_API_TOKEN is required; no token is created by this script');
  async function api(path, options={}) {
    const response = await fetch(apiRoot+path,{...options,redirect:'error',
      headers:{Authorization:'Bearer '+token,...options.headers}});
    let data;
    try { data = await response.json(); } catch { throw new Error('Cloudflare returned an invalid JSON response'); }
    if (!response.ok || !data.success) {
      // Do not print response bodies, tokens, environment variables or bindings.
      throw new Error('Cloudflare API '+(options.method||'GET')+' '+path+' failed: HTTP '+response.status);
    }
    return data.result;
  }
  const current = () => api(workerPath+'/deployments?per_page=1').then(x=>x.deployments[0]);
  const before = await current();
  assert.equal(before.versions.length,1,'Split deployments require manual review');
  const live = await api(workerPath+'/versions/'+before.versions[0].version_id);
  assert.ok(live.resources.bindings.some(b=>b.name==='ASSETS'&&b.type==='assets'),'Current version must preserve ASSETS');
  assert.equal(live.resources.script_runtime.assets.raw_run_worker_first,true,'Refuse an assets-only baseline');
  assert.ok(live.resources.bindings.length===1 && live.resources.bindings[0].name==='ASSETS' && live.resources.bindings[0].type==='assets','Unexpected bindings require manual review');
  assert.equal(live.resources.script_runtime.compatibility_date,'2026-08-08','Unexpected runtime date');
  assert.deepEqual(live.resources.script_runtime.compatibility_flags||[],[],'Unexpected runtime flags');
  const previewSettings = await api(workerPath+'/subdomain');
  assert.equal(previewSettings.previews_enabled,true,'Existing preview URLs must be enabled; this script does not change security settings');
  const {subdomain} = await api('/workers/subdomain');
  assert.ok(/^[a-z0-9-]+$/.test(subdomain),'Invalid Workers subdomain');

  // Baseline hashes prevent promotion if keep_assets selected the wrong asset set.
  const expected = new Map();
  const semesterResponse=await fetch('https://grupoiusgentium.com.br/semestre-2026-2',{redirect:'error'});
  assert.equal(semesterResponse.status,200,'Existing semester page');
  const semesterHTML=await semesterResponse.text();
  const semesterAssets=[...semesterHTML.matchAll(/\/semestre-2026-2\/[a-zA-Z0-9._-]+/g)].map(m=>m[0]);
  assert.ok(semesterAssets.length>0,'Semester asset inventory missing');
  const retainedPaths=[...new Set(['/semestre-2026-2.css','/site.css','/site.js',
    '/logo-48.webp','/logo-120.webp','/logo-300.webp','/editais/edital-pibic-2026-2027.pdf',...semesterAssets])];
  for (const path of retainedPaths) {
    const r = await fetch('https://grupoiusgentium.com.br'+path,{redirect:'error'});
    assert.equal(r.status,200,'Baseline asset '+path);
    expected.set(path,createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'));
  }
  const body = new FormData();
  body.append('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}));
  for(const {name,bytes} of modules) body.append(name,new Blob([bytes],{type:'application/javascript+module'}),name);
  // Never automatically retry a write: its result may be uncertain.
  const uploaded = await api(workerPath+'/versions',{method:'POST',body});
  assert.match(uploaded.id,/^[a-f0-9-]{36}$/);
  console.log('Uploaded candidate version '+uploaded.id+'; active deployment remains '+before.id);
  const preview = 'https://'+uploaded.id.slice(0,8)+'-'+worker+'.'+subdomain+'.workers.dev';
  const candidate = await api(workerPath+'/versions/'+uploaded.id);
  assert.equal(candidate.resources.script_runtime.assets.raw_run_worker_first,true);
  assert.ok(candidate.resources.bindings.some(b=>b.name==='ASSETS'&&b.type==='assets'));
  for (const path of new Set([...smokePaths,...retainedPaths,'/semestre-2026-2'])) {
    const r=await fetch(preview+path,{redirect:'error'});
    assert.equal(r.status,200,'Preview '+path);
    const bytes=Buffer.from(await r.arrayBuffer());
    assert.ok(bytes.length>0,'Empty preview asset '+path);
    if(expected.has(path)) assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.get(path),'Asset changed '+path);
    if(path===eventPath) assert.ok(bytes.toString().includes('Cristiane Derani'),'Event content missing');
  }
  for(const path of ['/.git/HEAD','/production/baseline.mjs']) {
    const r=await fetch(preview+path,{redirect:'error'});
    assert.equal(r.status,404,'Repository source must not be public: '+path);
  }
  assert.equal((await current()).id,before.id,'Production changed during preview; refusing to overwrite');
  const branchResponse=await fetch('https://api.github.com/repos/anavvanzin/grupoiusgentium.com.br/branches/main',{
    redirect:'error',headers:{Accept:'application/vnd.github+json','User-Agent':'ius-gentium-deploy'}});
  assert.equal(branchResponse.status,200,'Cannot verify latest main commit');
  assert.equal((await branchResponse.json()).commit.sha,process.env.WORKERS_CI_COMMIT_SHA,'Stale build: main changed');
  const deployment=await api(workerPath+'/deployments',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({strategy:'percentage',versions:[{version_id:uploaded.id,percentage:100}],
      annotations:{'workers/message':'Verified asset-preserving pipeline; previous version '+before.versions[0].version_id}})});
  console.log('Created deployment '+deployment.id+'; version '+uploaded.id);
  const after=await current();
  assert.equal(after.id,deployment.id,'Unexpected deployment; inspect before retrying');
  assert.equal(after.versions.length,1,'Unexpected split deployment');
  assert.equal(after.versions[0].percentage,100,'Deployment is not at 100 percent');
  assert.equal(after.versions[0].version_id,uploaded.id,'Deployment readback mismatch; inspect before retrying');
  for(const host of ['grupoiusgentium.com.br','www.grupoiusgentium.com.br']) {
    const r=await fetch('https://'+host+eventPath,{redirect:'error'});
    assert.equal(r.status,200,'Production event '+host);
    assert.ok((await r.text()).includes('Cristiane Derani'));
  }
  console.log('PASS: preview, retained assets, source exclusion, deployment readback and both public event routes.');
}
if (process.argv[1] && fileURLToPath(import.meta.url)===fileURLToPath(new URL('file://'+process.argv[1]))) {
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}

