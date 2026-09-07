# P1—P5 Final 集成发布记录

## 发布入口

P1 GitHub Pages 是课程总入口，项目卡片同时链接 P1—P5 的生产站和 GitHub 仓库。执行 `npm run smoke:production` 可检查 5 个前端入口与 P2—P4 健康地址。

## 第 16 次课三学时

1. 发布清单与故障回滚演示：从 P1 逐站打开，解释 URL → CI → commit → Release 的追溯链。
2. 干净构建与生产巡检：`npm ci && npm test && npm run build && npm run smoke:production`。
3. 恢复演练：P1/P5 使用上一 Tag 重新构建；P2/P3 验证数据库备份恢复记录；P4 切换 fallback 后复查健康与生成。

## 验收证据

- P1—P5 生产入口全部返回 200。
- P1—P5 最新 CI 全绿，P1/P2/P3/P4/P5 均有 Release/Tag。
- P2/P3 有 SQLite/MySQL 备份恢复记录；P4 无密钥可降级；P5 外部来源失败可切回合成音。
- P6 是选做，不阻塞 Final。

## 回滚判断

仅外部依赖失败时优先降级：P4 切 fallback，P5 切合成音。应用代码回归才回滚发布；数据项目先检查迁移兼容，再按已经演练的备份恢复手册操作。
