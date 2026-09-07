# 星声音乐站（P5）

课堂点歌、播放队列与合规音乐来源 Adapter。默认音频由浏览器即时合成，不依赖账号、不下载第三方录音。

```powershell
# 按锁文件精确安装 P5 依赖。
npm ci
# 检查播放器和队列文件。
npm run check
# 运行队列、来源适配和组件测试。
npm test
# 生成生产构建。
npm run build
# 启动开发服务器；结束时按 Ctrl+C。
npm run dev
```

版本路线：v1.0 mock 队列；v1.1 合法公开来源适配；v1.2 主持控制、日志与真实试用。
