import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const dir='D:/agent项目助理/codex-agent-case-review-20261021/boundary';fs.mkdirSync(dir+'/public',{recursive:true});fs.mkdirSync(dir+'/outside',{recursive:true});fs.writeFileSync(dir+'/outside/proof.png','dummy test content');
if(!fs.existsSync(dir+'/public/link'))fs.symlinkSync(dir+'/outside',dir+'/public/link','junction');
const {resolvePublicFile}=await import(pathToFileURL('D:/agent项目助理/agent-case/scripts/import-guides.mjs'));
const r=resolvePublicFile('/link/proof.png',dir+'/public');const record={result:r,realpath:fs.realpathSync(dir+'/public/link/proof.png'),publicRealpath:fs.realpathSync(dir+'/public')};fs.writeFileSync(dir+'/result.json',JSON.stringify(record,null,2));console.log(record);
