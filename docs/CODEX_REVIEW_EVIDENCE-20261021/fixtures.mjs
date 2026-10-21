import fs from 'node:fs';import crypto from 'node:crypto';
const root='D:/agent项目助理/agent-case';const dir='D:/agent项目助理/codex-agent-case-review-20261021';const dest=root+'/data/guides.json';const original=fs.readFileSync(dir+'/backup/data/guides.json');
const mode=process.argv[2];
if(mode==='fixture'){
 const data=JSON.parse(original);data.push({...data[0],slug:'codex-review-fixture',title:'Codex 临时 Markdown 渲染复核',body:['## first','  ## indented','## last','','## a','## a','## a-1','','| 列一 | 列二 |','|---|---|','| 单元格 | 数值 |','','```text','## fence fake','```','','![下载入口（来源：官方页面 https://cursor.com/download）](/guides/cursor-guide/01-download.png)'].join('\n')});fs.writeFileSync(dest,JSON.stringify(data,null,2)+'\n');
} else if(mode==='empty')fs.writeFileSync(dest,'[]\n');else if(mode==='restore')fs.writeFileSync(dest,original);else throw Error('bad mode');
console.log(JSON.stringify({mode,sha256:crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex'),baseline:crypto.createHash('sha256').update(original).digest('hex')}));
