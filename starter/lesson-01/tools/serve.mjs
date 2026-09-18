// 可选本地服务器：node tools/serve.mjs；终端出现网址后再打开浏览器。
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname+'index.html' : pathname));
    const relative = path.relative(root,target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403);res.end('Forbidden');return; }
    const data = await fs.readFile(target);
    res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data);
  } catch { res.writeHead(404);res.end('Not found'); }
});
server.on('error',error=>{console.error('启动失败：'+error.message+'。如端口被占用，先按 Ctrl+C 关闭旧服务。');process.exitCode=1;});
server.listen(5173,'127.0.0.1',()=>console.log('打开 http://127.0.0.1:5173/；停止服务按 Ctrl+C'));
