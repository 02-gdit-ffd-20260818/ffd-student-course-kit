FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --workspace backend --include-workspace-root && npm cache clean --force
# ============ TODO 05（中等）：容器里不要用 root 跑应用 ============
# 终端里看得到的结果：docker compose exec backend whoami
# 打印 **node** 而不是 root。
#
# TODO：在 CMD 之前加一行 USER node
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
