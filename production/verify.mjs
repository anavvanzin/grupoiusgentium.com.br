import assert from 'node:assert/strict';
import original from './baseline.mjs';
import current from './worker.generated.mjs';
import { event, eventPath } from './event.mjs';
const origin='https://grupoiusgentium.com.br';
const env={ASSETS:{fetch:async r=>new Response('preserved-asset:'+new URL(r.url).pathname)}};
const unchanged=['/sobre','/pesquisa','/biblioteca','/coordenador','/contato','/semestre-2026-2','/api/network','/site.css','/site.js','/logo-48.webp','/editais/edital-pibic-2026-2027.pdf'];
for(const path of unchanged){
  const [a,b]=await Promise.all([original.request(origin+path,{},env),current.request(origin+path,{},env)]);
  assert.equal(a.status,b.status,path);
  const clean=s=>s.replace('<link rel="stylesheet" href="/saberes-franca-brasil-2026/event.css"/>','');
  assert.equal(clean(await a.text()),clean(await b.text()),path);
}
for(const path of ['/','/anuncios','/arquivo',eventPath]){
  const r=await current.request(origin+path,{},env);assert.equal(r.status,200,path);
  assert.ok(r.headers.get('content-security-policy'));
  const text=await r.text();assert.ok(text.includes(event.title));
  if(path===eventPath){
    for(const name of ['Cristiane Derani','Paula Pimenta Velloso','Ius Commune — UFSC/CNPq','Ana Vitória Vanzin Mendes'])assert.ok(text.includes(name),name);
    assert.equal((text.match(/<h1[ >]/g)||[]).length,1);
    assert.ok(text.includes(event.sourceUrl));
  }
}
const results=await (await current.request(origin+'/api/archive?q=saberes&type=evento',{},env)).json();
assert.equal(results.count,1);assert.equal(results.results[0].slug,event.slug);
for(const path of [eventPath,'/saberes-franca-brasil-2026/cartaz-final.webp','/saberes-franca-brasil-2026/inscricoes.webp','/saberes-franca-brasil-2026/event.css']){
  const r=await current.request(origin+path,{method:'HEAD'},env);assert.equal(r.status,200,path);assert.equal((await r.arrayBuffer()).byteLength,0);
}
for(const [path,target] of [['/eventos','/arquivo?type=evento'],['/eventos.html','/arquivo?type=evento'],['/index.html','/'],['/anuncios.html','/anuncios']]){
  const r=await current.request(origin+path,{},env);assert.ok([301,302].includes(r.status));assert.equal(r.headers.get('location'),target);
}
console.log('PASS: preserved routes/assets, event surfaces, names, search, HEAD and legacy redirects.');
