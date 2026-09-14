import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
for(const id of ['about-title','skills-title']){const sec=html.match(new RegExp('<section[^>]*aria-labelledby="'+id+'"[\\s\\S]*?</section>'));assert.ok(sec,'缺少 '+id+' 区块');assert.ok(sec[0].includes('<h2'),'区块需要 h2');}
assert.ok(/<ul[\s\S]*?<li[\s\S]*?<li/.test(html),'至少两项技能');assert.ok(/<h1>[^<]+<\/h1>/.test(html),'主标题不能为空');
console.log('第01课结构验收通过；另做手机访问和链接人工检查。');