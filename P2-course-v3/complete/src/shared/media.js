// 前后端共用输入规则：媒体是结构化数据，不接受任意HTML代码。
export function safeMediaUrl(value) {
 if(typeof value!=='string'||value.length>1500||/[\s\\]/.test(value))return false
 if(value.startsWith('/media/')&&!value.includes('..')&&!value.startsWith('//'))return true
 try { const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password } catch {return false}
}
export function validateMedia(items) {
 if(items===undefined)return ''
 if(!Array.isArray(items)||items.length>6)return '每篇文章最多添加6项媒体'
 for(const item of items){
  if(!item||!['image','audio','video'].includes(item.type)||!safeMediaUrl(item.url))return '媒体类型须为图片/音频/视频；使用本站/media/路径或HTTPS地址'
  if(typeof item.caption!=='string'||item.caption.length>200)return '媒体说明不能超过200字'
  if(item.type==='image'&&(typeof item.alt!=='string'||!item.alt.trim()||item.alt.length>200))return '请为图片填写1—200字替代文字'
  if(item.afterParagraph!==undefined&&item.afterParagraph!==null&&(!Number.isInteger(item.afterParagraph)||item.afterParagraph<1||item.afterParagraph>200))return '插入位置填写1—200的段落序号，或留空放在文末'
 }
 return ''
}
export function normalizeMedia(items=[]){return items.map(item=>({type:item.type,url:item.url,caption:item.caption||'',alt:item.alt||'',afterParagraph:item.afterParagraph||null}))}
