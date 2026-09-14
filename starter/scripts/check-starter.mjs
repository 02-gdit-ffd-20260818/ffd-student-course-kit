import {existsSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
for(const file of ['index.html','package.json','package-lock.json']) assert.ok(existsSync(file),file+' missing');
const p=JSON.parse(readFileSync('package.json','utf8'));assert.ok(p.scripts.dev);assert.ok(p.scripts['check:lesson']);
console.log('起步文件与课堂命令存在。继续 npm run dev；本课验收在完成任务后运行。');
