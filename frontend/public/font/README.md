# 字体说明

- `Pacifico-Regular.ttf`：Logo 与英文装饰字体。
- `UnidreamLED.ttf`：数字时钟字体。

文件名与 `frontend/src/assets/css/styles.css` 中的 `@font-face` 路径一致；替换字体后需重新构建前端。

```bash
npm run build  # 重新构建前端，让新字体进入生产文件；生产服务器由 Docker 构建镜像，不需要单独执行此命令
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`npm` 管理项目依赖并执行脚本；`install` 安装依赖（有兼容的锁文件时使用锁定版本）；`ci` 严格按锁文件安装并重建 node_modules；`run 名称` 执行当前 package.json 的 scripts 中同名命令；`test` 是运行测试脚本。先确认终端所在目录有本课 package.json。服务启动后持续占用终端是正常的，另开终端做下一步，Ctrl+C 才停止服务。
<!-- COMMAND_HELP:END -->
