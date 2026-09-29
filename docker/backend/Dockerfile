FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --workspace backend --include-workspace-root && npm cache clean --force
# ============ 第15课 TODO 05（中等）：容器里不要用 root 跑应用 ============
# 【修改边界】只改本任务注释指定的占位代码；保留函数、路由、选择器等外层结构，也不要提前修改其他课次 TODO。
# 【动手顺序】先逐条读要求，把每条要求写成一个条件或一条语句；再按注释给出的顺序组合，不要凭感觉一次写一大段。
# 【完成标准】保存后执行本课手册该 TODO 的“自己验证”；结果、状态码或页面效果全部一致才算完成，卡住再对照本课教师答案。
# 终端里看得到的结果：docker compose exec backend whoami
# 打印 **node** 而不是 root。
#
# 本任务要补全：在 CMD 之前加一行 USER node
#   node 官方镜像里预置了一个叫 node 的普通用户。
#
# 为什么重要：容器**不是虚拟机**，它和宿主机共用同一个内核。
# 容器里的 root 在某些配置下（挂载了宿主目录、开了特权模式）
# 能影响到宿主机。用普通用户跑，等于多了一层保险。
#
# 配套的还有 compose.yaml 里那行 security_opt: [no-new-privileges:true]，
# 意思是"这个容器里的进程**不能再提权**"。
#
# 这一课的安全三件套：端口只绑本机（TODO 03）、
# 密码从 .env 读（TODO 04）、非 root 运行（TODO 05）。
# **上线前逐条对一遍。**
# ========================================================
COPY --chown=node:node backend ./backend
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3003/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "backend/src/server.js"]
