import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync('styles.css','utf8');assert.match(css,/@media\s*\(min-width:\s*700px\)/);assert.match(css,/@media\s+print/);assert.match(css,/break-inside:\s*avoid/);
console.log('第02课规则存在；必须另在390/1280宽度及打印预览检查真实效果。');