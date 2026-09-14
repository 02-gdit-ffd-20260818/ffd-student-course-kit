import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

class Element {constructor(tag){this.tag=tag;this.children=[];this.textContent=''} append(...xs){this.children.push(...xs)} replaceChildren(...xs){this.children=xs}}
const list=new Element('div'),status=new Element('p');
globalThis.document={querySelector:s=>s==='#project-list'?list:status,createElement:t=>new Element(t)};
const {renderProjects}=await import('../app.js');
renderProjects([{name:'A',skills:['HTML'],status:'已完成'}]);assert.equal(list.children.length,1);assert.equal(list.children[0].tag,'article');
renderProjects([{name:'B'},{name:'C'}]);assert.equal(list.children.length,2,'重新渲染不能累加旧卡片');
renderProjects([]);assert.equal(list.children[0].tag,'p');assert.match(status.textContent,/0/);
console.log('第03课正常、重复渲染、空数组验收通过。');
