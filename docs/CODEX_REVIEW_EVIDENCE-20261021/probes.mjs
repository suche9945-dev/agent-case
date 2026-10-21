import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
const repo='D:/agent项目助理/agent-case';const dir='D:/agent项目助理/codex-agent-case-review-20261021';process.chdir(repo);
const mod=await import(pathToFileURL(repo+'/scripts/import-guides.mjs'));const headings=await import(pathToFileURL(repo+'/src/lib/headings.ts'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const rows=[];
const json=repo+'/data/guides.json';const before=fs.readFileSync(json);const fixture=repo+'/content/guides/zz-codex-review-invalid.md';if(fs.existsSync(fixture))throw Error('fixture already exists');
try{
 const original=fs.readFileSync(repo+'/content/guides/cursor-guide.md','utf8');
 for(const [name,content] of [['missing',original.replace(/^tool:.*\n/m,'')],['unknown',original.replace(/^tool:.*$/m,'tool: codex-no-tool')],['date-format',original.replace(/^updatedAt:.*$/m,'updatedAt: 2026-10-20T00:00:00')],['date-unreal',original.replace(/^updatedAt:.*$/m,'updatedAt: 2026-02-30')],['screenshot',original.replace('/guides/cursor-guide/01-download.png','/guides/not-found.png')],['wrong-type',original.replace(/^title:.*$/m,'title: 123')]]){
  fs.writeFileSync(fixture,content);const r=spawnSync(process.execPath,['scripts/import-guides.mjs'],{cwd:repo,encoding:'utf8'});rows.push({test:name,exit:r.status,unchanged:sha(before)===sha(fs.readFileSync(json)),stderr:r.stderr});
 }
}finally{if(fs.existsSync(fixture))fs.unlinkSync(fixture);if(sha(before)!==sha(fs.readFileSync(json)))fs.writeFileSync(json,before);}
const success1=spawnSync(process.execPath,['scripts/import-guides.mjs'],{cwd:repo,encoding:'utf8'});const first=fs.readFileSync(json);const success2=spawnSync(process.execPath,['scripts/import-guides.mjs'],{cwd:repo,encoding:'utf8'});rows.push({test:'real-json-idempotent',exit1:success1.status,exit2:success2.status,same:sha(first)===sha(fs.readFileSync(json)),matchesBaseline:sha(before)===sha(fs.readFileSync(json))});
rows.push({test:'heading-id-collision',actual:headings.extractHeadings('## a\n## a\n## a-1')});
rows.push({test:'leading-spaces',actual:headings.extractHeadings('## first\n  ## indented\n## last')});
// Mutation only in an isolated copy; production files remain untouched.
const isolated=path.join(dir,'mutation');fs.mkdirSync(isolated,{recursive:true});for(const f of ['scripts/import-guides.mjs','scripts/verify-import.mjs','scripts/verify-headings.mjs','src/lib/headings.ts','data/guides.json','public/icons/brands/cursor.svg']){const dest=path.join(isolated,f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(repo,f),dest);}fs.cpSync(repo+'/data/products',isolated+'/data/products',{recursive:true});
// Reuse installed dependencies for the test copy only.
fs.mkdirSync(isolated+'/node_modules',{recursive:true});for(const dep of ['yaml','zod'])if(!fs.existsSync(isolated+'/node_modules/'+dep))fs.cpSync(fs.realpathSync(repo+'/node_modules/'+dep),isolated+'/node_modules/'+dep,{recursive:true});
fs.writeFileSync(isolated+'/scripts/verify-import.mjs',fs.readFileSync(isolated+'/scripts/verify-import.mjs','utf8').replace('dupes.length === 1','dupes.length === 999'));
fs.writeFileSync(isolated+'/scripts/verify-headings.mjs',fs.readFileSync(isolated+'/scripts/verify-headings.mjs','utf8').replace('headings.length === 8','headings.length === 999'));
for(const name of ['verify-import','verify-headings']){const r=spawnSync(process.execPath,['scripts/'+name+'.mjs'],{cwd:isolated,encoding:'utf8',env:{...process.env,TEMP:dir+'/tmp',TMP:dir+'/tmp'}});rows.push({test:name+'-intentional-fail',exit:r.status,hasFail:r.stdout.includes('FAIL'),summary:r.stdout.split('\n').filter(x=>x.startsWith('共 ')),stderr:r.stderr});}
fs.writeFileSync(dir+'/independent-probes.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));
