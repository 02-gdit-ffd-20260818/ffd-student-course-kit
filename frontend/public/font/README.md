# Logo 字体说明

这个目录存放前端直接引用的字体文件。当前项目包含：

- `Pacifico-Regular.ttf`：在 `styles.css` 和 `Message.vue` 中使用。
- `UnidreamLED.ttf`：在 `styles.css` 和 `Background.vue` 中使用。

字体位于 `frontend/public` 下，Vite 会把它们原样复制到构建结果中，因此浏览器访问路径是 `/font/文件名`，不是 `/src/...`。

## 替换字体

如果你有字符覆盖范围更大的 Pacifico 字体文件，可以替换现有文件，但最终文件名必须保持为 `Pacifico-Regular.ttf`：

```powershell
# 进入字体目录；下面的路径按当前项目根目录计算
cd frontend\public\font

# 先备份原字体，便于出现问题时恢复
Copy-Item -LiteralPath .\Pacifico-Regular.ttf -Destination .\Pacifico-Regular.ttf.backup

# 将新的字体复制为项目正在引用的文件名；把 <新字体路径> 换成真实路径
Copy-Item -LiteralPath <新字体路径> -Destination .\Pacifico-Regular.ttf -Force

# 返回项目根目录；从 frontend/public/font 需要返回三级目录
cd ..\..\..

# 进入前端目录并重新构建，检查字体是否被正确打包
cd frontend
npm run build
```

<!-- COMMAND_HELP:BEGIN -->
**本段命令怎么读**

`npm` 管理项目依赖并执行脚本；`install` 安装依赖（有兼容的锁文件时使用锁定版本）；`ci` 严格按锁文件安装并重建 node_modules；`run 名称` 执行当前 package.json 的 scripts 中同名命令；`test` 是运行测试脚本。先确认终端所在目录有本课 package.json。服务启动后持续占用终端是正常的，另开终端做下一步，Ctrl+C 才停止服务。

`copy`（CMD）/ `Copy-Item`（PowerShell）把第一个路径的文件复制到第二个路径。只在目标配置尚不存在时复制模板；已有 .env 时直接打开并检查所需项，避免覆盖已经填写的值。

`cd` / `Set-Location` 切换终端当前目录；含空格的路径用引号包起来。CMD 的 `/d` 同时切换盘符；PowerShell 用 `Set-Location "路径"`，不加 `/d`。
<!-- COMMAND_HELP:END -->


如果你拿到的文件名是 `Pacifico-Regular-all.ttf`，也可以在字体目录中执行：

```powershell
# 将新字体复制成代码中已经使用的文件名；这样不用修改 Vue 和 CSS 文件
Copy-Item -LiteralPath .\Pacifico-Regular-all.ttf -Destination .\Pacifico-Regular.ttf -Force
```

## 注意事项

- 文件名和扩展名必须与 `frontend/src/assets/css/styles.css` 中的 `url()` 保持一致。
- 替换后需要重新运行 `npm run build`；开发服务器通常会自动刷新，但建议完整验证一次。
- 字体文件较大时会增加首次加载时间。只保留项目实际使用的字符集和字重，避免把不必要的字体一起提交。
- 修改前请保留备份；如果浏览器出现乱码或字体回退，先检查 Network 面板中的字体请求是否返回 `200`。
- 字体授权必须允许项目使用和分发，不要直接提交来源不明的商业字体。
