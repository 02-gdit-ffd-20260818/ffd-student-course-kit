# 字体说明

- `Pacifico-Regular.ttf`：Logo 与英文装饰字体。
- `UnidreamLED.ttf`：数字时钟字体。

文件名与 `frontend/src/assets/css/styles.css` 中的 `@font-face` 路径一致；替换字体后需重新构建前端。

```bash
npm run build  # 重新构建前端，让新字体进入生产文件；生产服务器由 Docker 构建镜像，不需要单独执行此命令
```
