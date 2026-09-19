# P2课程博客v3.1.1服务器验证版

先读[Windows实操手册](Windows-guide.md)。`media-starter`是本次两个媒体任务的起步工程；`complete`提供课程文章、真实SQLite、注册登录、文字评论、图片、音乐、视频、上传、备份和部署验收工具。`stage-7`与`stage-8`保留阶段答案。

静态媒体页面：https://ffd-p2-course-v3-20260918.netlify.app/stage-11/articles/html5-media

Ubuntu完整动态网页：http://47.120.73.69/ffd-p2-v31/

真实SQLite健康检查：http://47.120.73.69/ffd-p2-v31-api/health

服务器已实际完成注册、登录、评论权限、图片/音频/视频、真实上传、服务重启持久化和一致性备份验收。部署使用独立服务、端口、数据库和媒体目录，不覆盖旧版P2。当前动态网址为HTTP教学演示地址，正式长期开放登录前应绑定域名并启用HTTPS。详细证据见[Ubuntu部署说明](Ubuntu-deploy.md)。
