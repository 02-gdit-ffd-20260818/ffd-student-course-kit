# 群像云图｜P3 成员数字画像与协同管理平台

当前版本：`p3-v1.0` 成员画像。

## 教师从这里开始

```powershell
# 按锁文件精确安装 P3 依赖。
npm ci
# 检查成员数据和图表文件。
npm run check
# 运行筛选与图表测试。
npm test
# 生成生产构建。
npm run build
# 启动开发服务器；结束时按 Ctrl+C。
npm run dev
```

然后阅读 `docs/lesson-12-teacher-guide.md`。本版刻意只实现第 12 次课的第一个垂直切片：授权字段 → 公开白名单 → 画像卡片 → 详情 → 边界测试 → 发布。

## 已实现

- 8 条虚构成员数据和字段字典。
- 未授权资料过滤与公开字段白名单。
- 响应式画像卡片、详情面板和图片失败回退。
- 空地点、空介绍、空兴趣与空技能处理。
- 正常、边界、失败/隐私自动测试。
- GitHub Actions、Netlify 配置与 SPA fallback。
- CI 通过后触发的 Netlify 自动生产部署。

## 固定入口

- 仓库：<https://github.com/02-gdit-ffd-20260818/ffd-p3-community>
- 生产站点：<https://ffd-p3-community.netlify.app/>

## 版本路线

- `p3-v1.0`：画像、详情、授权与最少采集。
- `p3-v1.1`：关键字/技能筛选、聚合函数与 ECharts 图谱。
- `p3-v2.0`：提交审核、服务器 RBAC、CSV 事务导入、脱敏导出与 MySQL。
