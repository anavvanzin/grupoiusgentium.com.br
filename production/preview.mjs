import { createServer } from 'node:http';
import app from './worker.generated.mjs';
const env={ASSETS:{fetch:async request=>{
  const path=new URL(request.url).pathname;
  return fetch('https://grupoiusgentium.com.br'+path);
}}};
createServer(async(req,res)=>{
  try{const r=await app.fetch(new Request('http://127.0.0.1:4173'+req.url,{method:req.method}),env,{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}
  catch(e){res.writeHead(500);res.end(String(e));}
}).listen(4173,'0.0.0.0',()=>console.log('Preview ready on 4173'));
