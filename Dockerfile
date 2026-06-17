# 符寶網 Docker 部署
# 多阶段构建：构建阶段 + 运行阶段
# 优化：依赖缓存层，package.json 不变时不重新安装

# ===== 构建阶段 =====
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 先复制依赖文件（利用 Docker 缓存层，package.json 不变则跳过安装）
COPY package.json pnpm-lock.yaml* ./

# 安装依赖（带缓存挂载）
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建
RUN pnpm build

# ===== 运行阶段（精简镜像） =====
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
ENV DEPLOY_RUN_PORT=5000

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件并仅安装生产依赖
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# 从构建阶段复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/php ./php
COPY --from=builder /app/sql ./sql
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/components.json ./

# 暴露端口
EXPOSE 5000

# 启动
CMD ["pnpm", "start"]
