import assert from 'node:assert/strict';
import { readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';

export const generalPaths = ['/semestre-2026-2.css', '/site.css', '/site.js',
  '/logo-48.webp', '/logo-120.webp', '/logo-300.webp', '/editais/edital-pibic-2026-2027.pdf'];
const types = {'.css':'text/css', '.js':'text/javascript', '.webp':'image/webp',
  '.pdf':'application/pdf', '.svg':'image/svg+xml', '.png':'image/png'};
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
// The official Cloudflare TypeScript example uses SHA-256(base64(bytes) + extension),
// truncated to 32 hex characters. This is an upload identity, separate from integrity SHA-256.
// https://github.com/cloudflare/cloudflare-typescript/blob/main/examples/workers/script-with-assets-upload.ts
export const uploadHash = (path, bytes) => sha256(bytes.toString('base64') + extname(path).slice(1)).slice(0,32);
export function allowedPath(path) {
  return generalPaths.includes(path) || /^\/semestre-2026-2\/[a-zA-Z0-9_-]+\.(svg|png|webp)$/.test(path);
}
export function assetType(path) {
  assert.ok(allowedPath(path), 'Asset path outside the public allowlist: '+path);
  return types[extname(path)];
}
export function checkBytes(path, bytes, contentType) {
  assert.equal(contentType.split(';')[0].trim().toLowerCase(), assetType(path), 'Wrong asset type: '+path);
  assert.ok(bytes.length>0 && bytes.length<=10*1024*1024, 'Invalid asset size: '+path);
  const text = bytes.toString('utf8');
  if(path.endsWith('.pdf')) assert.equal(bytes.subarray(0,5).toString(), '%PDF-', 'Invalid PDF: '+path);
  else if(path.endsWith('.webp')) {
    assert.equal(bytes.subarray(0,4).toString(), 'RIFF', 'Invalid WebP: '+path);
    assert.equal(bytes.subarray(8,12).toString(), 'WEBP', 'Invalid WebP: '+path);
  } else if(path.endsWith('.png')) assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a', 'Invalid PNG: '+path);
  else if(path.endsWith('.svg')) assert.match(text, /<svg[\s>]/, 'Invalid SVG: '+path);
  else assert.doesNotMatch(text, /^\s*(?:<!doctype\s+html|<html)/i, 'HTML returned as an asset: '+path);
}
export function semesterReferences(html) {
  return [...new Set([...html.matchAll(/\/semestre-2026-2\/[a-zA-Z0-9._-]+/g)].map(m=>m[0]))];
}
export function cssReferences(css, path) {
  const refs = [...css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/gi)];
  return [...new Set(refs.map(m=>m[1]||m[2]).filter(x=>!x.startsWith('data:')&&!x.startsWith('#'))
    .map(x=>new URL(x, 'https://grupoiusgentium.com.br'+path))
    .filter(x=>x.origin==='https://grupoiusgentium.com.br').map(x=>{
      assert.ok(!x.search, 'Unexpected asset query: '+x.pathname);
      assert.ok(allowedPath(x.pathname), 'CSS dependency outside allowlist: '+x.pathname);
      return x.pathname;
    }))];
}
export async function loadAssets(root = new URL('./',import.meta.url)) {
  assert.ok((await lstat(new URL('public-assets',root))).isDirectory(),'Asset snapshot root must be a directory');
  const record = JSON.parse(await readFile(new URL('assets-manifest.json',root),'utf8'));
  assert.equal(record.sourceVersion, '68fdf213-c1f7-4f87-8257-0d4f3ef51d81', 'Unreviewed asset baseline');
  const entries=Object.entries(record.assets);
  assert.ok(entries.length>=generalPaths.length && entries.length<100, 'Invalid asset inventory');
  const assets=new Map();
  for(const [path,info] of entries) {
    assert.ok(allowedPath(path), 'Asset path outside allowlist: '+path);
    const url=new URL('public-assets'+path,root);
    assert.ok((await lstat(url)).isFile(), 'Asset must be a regular file: '+path);
    const bytes=await readFile(url);
    checkBytes(path,bytes,info.contentType);
    assert.equal(bytes.length,info.size,'Asset size mismatch: '+path);
    assert.equal(sha256(bytes),info.sha256,'Asset SHA-256 mismatch: '+path);
    assert.equal(uploadHash(path,bytes),info.hash,'Asset upload hash mismatch: '+path);
    assets.set(path,{...info,bytes});
  }
  // Never recursively publish a directory. This walk only rejects unlisted files and symlinks.
  async function inventory(dir,prefix='') {
    const paths=[];
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      assert.ok(!entry.isSymbolicLink(),'Symlink in asset snapshot');
      const path=prefix+'/'+entry.name;
      if(entry.isDirectory()) paths.push(...await inventory(new URL(entry.name+'/',dir),path));
      else {assert.ok(entry.isFile(),'Unexpected asset entry');paths.push(path);}
    }
    return paths;
  }
  const directory=new URL('public-assets/',root);
  assert.deepEqual((await inventory(directory)).sort(),[...assets.keys()].sort(),'Unlisted snapshot files');
  assert.ok([...assets.values()].reduce((n,a)=>n+a.size,0)<30*1024*1024,'Snapshot too large');
  return assets;
}
export function verifyInventory(assets, html) {
  const required=new Set([...generalPaths,...semesterReferences(html)]);
  assert.ok(required.size>generalPaths.length,'Semester asset inventory missing');
  for(const [path,a] of assets) if(path.endsWith('.css')) for(const ref of cssReferences(a.bytes.toString(),path)) required.add(ref);
  assert.deepEqual([...assets.keys()].sort(),[...required].sort(),'Snapshot must match general, DOM and CSS assets exactly');
}
