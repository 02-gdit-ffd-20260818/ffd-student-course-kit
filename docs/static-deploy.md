# 静态网页发布：Windows图形操作主路线

平台：Windows浏览器、CMD或PowerShell。位置：自己的工程根目录。学生先完成测试和构建。

```text
npm.cmd run build
```

build把Vue源码转换为浏览器可用文件，成功后工程中出现dist。打开文件资源管理器→个人工程→dist，里面必须有index.html和assets；不要上传src、node_modules或整个工程。

浏览器访问https://app.netlify.com/drop，登录自己的账号。将dist文件夹拖入上传区，部署结束后复制平台生成的https网址。记录自己的站点名、网址、Git提交编号。再次发布在自己已有站点的Deploys页面拖入新dist，避免每次新建站点。网页按目录结构托管，Vue路由需要SPA回退：netlify.toml在Git构建部署时生效；纯拖拽时在dist中增加_redirects文件，内容为下面一行（文件名没有.txt）：

```text
/* /index.html 200
```

推荐首次使用Netlify从Git导入：Add new project→Import an existing project→GitHub→选自己的项目仓库；Build command为npm run build，Publish directory为dist；Node版本24。netlify.toml已附带SPA回退；每次push更新同一网址。此路线不会给你自动部署Express和SQLite。

第7—8、12、15课可发布静态主路径。博客第9课以后、社区第13课、卡片完整生成接口需要独立API：按Ubuntu同源部署手册，把dist、API与持久数据库部署在自己的服务器。同源路径/api由Nginx转发；不能把生产请求指向127.0.0.1，后者是访问者自己的电脑。

检查：用新浏览器窗口打开站点，刷新详情路由，手机检查宽度。静态托管下动态请求失败时，应记录为接口尚未部署，不能把仅有页面判为完整后端上线。
