import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
if (existsSync('.env')) { console.log('.env 已存在，保留原配置。'); process.exit(0); }
let text=readFileSync('.env.example','utf8');
text=text.replace(/^SESSION_SECRET=.*$/m,'SESSION_SECRET='+randomBytes(32).toString('hex'));
for(const key of ['ADMIN_PASSWORD','MEMBER_PASSWORD','REVIEWER_PASSWORD']) text=text.replace(new RegExp('^'+key+'=.*$','m'),key+'='+randomBytes(12).toString('hex'));
writeFileSync('.env',text); console.log('.env 已创建；本项目没有登录账号。请在编辑器查看配置，模型密钥仅填入 .env，不上传该文件。');
