# 符寶網 Docker 部署（仅 Next.js SSR）
# 架构：
#   宿主机 Nginx → /api/* → 本地 PHP-FPM（非容器内）
#                → /*    → Docker 容器 Next.js (5000)
#
# PHP 运行在 CentOS 7 宿主机上，不纳入 Docker 镜像

# ===== 构建阶段 =====
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 先复制依赖文件（利用 Docker 缓存层）
COPY package.json pnpm-lock.yaml* ./

# 安装依赖（BuildKit 缓存挂载，避免每次重建下载 1085 个包）
RUN --mount=type=cache,target=/root/.local/share/ppnpm/store \
    pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .
RUN pnpm build

# ===== 运行阶段 =====
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 从构建阶段复制产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/php ./php

# 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai

# 创建上传目录和运行时目录
RUN mkdir -p /app/public/uploads/goods /app/public/uploads/content \
    /app/public/uploads/news /app/public/uploads/baike \
    /app/php/runtime/cache /app/php/runtime/log \
    /app/php/public/uploads && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
