import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const repo='D:/agent项目助理/agent-case';
const dir='D:/agent项目助理/codex-agent-case-review-20261021';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const git=(...args)=>spawnSync('git',args,{cwd:repo,encoding:'utf8'}).stdout;
const files=()=>[...new Set(git('ls-files','-c','-o','--exclude-standard','-z').split('\0').filter(Boolean))].sort();
if(process.argv[2]==='baseline'){
 fs.mkdirSync(path.join(dir,'backup'),{recursive:true});
 const manifest={time:new Date().toISOString(),branch:git('branch','--show-current').trim(),head:git('rev-parse','HEAD').trim(),status:git('-c','core.quotePath=false','status','--short','--untracked-files=all'),files:{}};
 for(const file of files()){const b=fs.readFileSync(path.join(repo,file));manifest.files[file]=hash(b);const dest=path.join(dir,'backup',file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);}
 fs.writeFileSync(path.join(dir,'baseline.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({branch:manifest.branch,head:manifest.head,files:Object.keys(manifest.files).length,status:manifest.status}));
}
if(process.argv[2]==='check'){
 const baseline=JSON.parse(fs.readFileSync(path.join(dir,'baseline.json')));const now=files();const changed=Object.keys(baseline.files).filter(f=>!fs.existsSync(path.join(repo,f))||hash(fs.readFileSync(path.join(repo,f)))!==baseline.files[f]);
 console.log(JSON.stringify({changed,added:now.filter(f=>!(f in baseline.files)),head:git('rev-parse','HEAD').trim(),branch:git('branch','--show-current').trim()}));
}
if(process.argv[2]==='command'){
 const name=process.argv[3];const command=process.argv.slice(4).join(' ');const result=spawnSync('powershell.exe',['-NoProfile','-Command',command],{cwd:repo,encoding:'utf8',env:{...process.env,COREPACK_HOME:'D:/agent项目助理/.corepack'},timeout:300000,maxBuffer:15e6});
 fs.writeFileSync(path.join(dir,name+'.log'),result.stdout+'\n'+result.stderr+'\nEXIT='+result.status+'\n');console.log(JSON.stringify({name,command,exit:result.status,error:result.error?.message,stdout:result.stdout,stderr:result.stderr}));process.exitCode=result.status??1;
}
