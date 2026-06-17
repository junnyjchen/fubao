# 符寶網 Docker 部署
# 多阶段构建：构建阶段 + 运行阶段（含 Node.js + PHP-FPM + Nginx）
#
# 架构：
#   Nginx (80/443) → /api/* → PHP-FPM (9000)
#                    → /*    → Next.js SSR (5000)
#
# PHP 扩展要求：pdo_mysql, json, mbstring, openssl, curl, hash, gd, opcache, zip, fileinfo

# ===== 构建阶段：Node.js =====
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 先复制依赖文件（利用 Docker 缓存层）
COPY package.json pnpm-lock.yaml* ./

# 安装依赖（带缓存挂载）
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建 Next.js
RUN pnpm build

# ===== 运行阶段 =====
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
ENV DEPLOY_RUN_PORT=5000

# ========== 安装 PHP 8.1 + FPM + 必需扩展 ==========
RUN apk add --no-cache \
    php81 \
    php81-fpm \
    php81-pdo \
    php81-pdo_mysql \
    php81-mysqlnd \
    php81-json \
    php81-mbstring \
    php81-openssl \
    php81-curl \
    php81-hash \
    php81-session \
    php81-fileinfo \
    php81-gd \
    php81-opcache \
    php81-zip \
    php81-bcmath \
    php81-xml \
    php81-simplexml \
    php81-tokenizer \
    php81-ctype \
    php81-dom \
    php81-xmlwriter \
    php81-pecl-redis \
    # Nginx 和 Supervisor
    nginx \
    supervisor \
    # 其他工具
    curl \
    tzdata

# 设置时区
ENV TZ=Asia/Shanghai
RUN cp /usr/share/zoneinfo/${TZ} /etc/localtime && echo "${TZ}" > /etc/timezone

# ========== 配置 PHP-FPM ==========
# 修改 PHP-FPM 监听端口为 9000（与 Nginx 对接）
RUN sed -i 's/listen = .*/listen = 127.0.0.1:9000/' /etc/php81/php-fpm.d/www.conf \
    && sed -i 's/;listen.owner = nobody/listen.owner = nginx/' /etc/php81/php-fpm.d/www.conf \
    && sed -i 's/;listen.group = nobody/listen.group = nginx/' /etc/php81/php-fpm.d/www.conf \
    && sed -i 's/user = nobody/user = nginx/' /etc/php81/php-fpm.d/www.conf \
    && sed -i 's/group = nobody/group = nginx/' /etc/php81/php-fpm.d/www.conf

# PHP 配置优化
RUN echo "upload_max_filesize = 10M" >> /etc/php81/php.ini \
    && echo "post_max_size = 20M" >> /etc/php81/php.ini \
    && echo "max_execution_time = 60" >> /etc/php81/php.ini \
    && echo "memory_limit = 256M" >> /etc/php81/php.ini \
    && echo "max_file_uploads = 20" >> /etc/php81/php.ini \
    && echo "date.timezone = Asia/Shanghai" >> /etc/php81/php.ini \
    && echo "display_errors = Off" >> /etc/php81/php.ini \
    && echo "log_errors = On" >> /etc/php81/php.ini \
    && echo "error_log = /var/log/php/error.log" >> /etc/php81/php.ini

# 创建 PHP 运行时目录
RUN mkdir -p /var/log/php /var/run/php /app/php/runtime/cache /app/php/runtime/log \
    && chown -R nginx:nginx /var/log/php /var/run/php /app/php/runtime

# ========== 配置 Nginx ==========
RUN mkdir -p /var/log/nginx /var/run/nginx

# Nginx 主配置
RUN echo 'worker_processes auto;' > /etc/nginx/nginx.conf \
    && echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf \
    && echo 'pid /var/run/nginx/nginx.pid;' >> /etc/nginx/nginx.conf \
    && echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf \
    && echo 'http {' >> /etc/nginx/nginx.conf \
    && echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf \
    && echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf \
    && echo '    sendfile on;' >> /etc/nginx/nginx.conf \
    && echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf \
    && echo '    gzip on;' >> /etc/nginx/nginx.conf \
    && echo '    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;' >> /etc/nginx/nginx.conf \
    && echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf \
    && echo '}' >> /etc/nginx/nginx.conf

# Nginx 站点配置
COPY php/nginx.conf /etc/nginx/conf.d/default.conf

# ========== 配置 Supervisor (进程管理) ==========
RUN mkdir -p /etc/supervisor/conf.d

RUN echo '[supervisord]' > /etc/supervisor/supervisord.conf \
    && echo 'nodaemon=true' >> /etc/supervisor/supervisord.conf \
    && echo 'user=root' >> /etc/supervisor/supervisord.conf \
    && echo 'logfile=/var/log/supervisor/supervisord.log' >> /etc/supervisor/supervisord.conf \
    && echo 'pidfile=/var/run/supervisord.pid' >> /etc/supervisor/supervisord.conf \
    && echo '' >> /etc/supervisor/supervisord.conf \
    && echo '[program:php-fpm]' >> /etc/supervisor/supervisord.conf \
    && echo 'command=php-fpm81 -F' >> /etc/supervisor/supervisord.conf \
    && echo 'autostart=true' >> /etc/supervisor/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisor/supervisord.conf \
    && echo 'stdout_logfile=/var/log/php/fpm-access.log' >> /etc/supervisor/supervisord.conf \
    && echo 'stderr_logfile=/var/log/php/fpm-error.log' >> /etc/supervisor/supervisord.conf \
    && echo '' >> /etc/supervisor/supervisord.conf \
    && echo '[program:nginx]' >> /etc/supervisor/supervisord.conf \
    && echo 'command=nginx -g "daemon off;"' >> /etc/supervisor/supervisord.conf \
    && echo 'autostart=true' >> /etc/supervisor/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisor/supervisord.conf \
    && echo 'stdout_logfile=/var/log/nginx/access.log' >> /etc/supervisor/supervisord.conf \
    && echo 'stderr_logfile=/var/log/nginx/error.log' >> /etc/supervisor/supervisord.conf \
    && echo '' >> /etc/supervisor/supervisord.conf \
    && echo '[program:nextjs]' >> /etc/supervisor/supervisord.conf \
    && echo 'command=node /app/node_modules/.bin/next start -p 5000' >> /etc/supervisor/supervisord.conf \
    && echo 'directory=/app' >> /etc/supervisor/supervisord.conf \
    && echo 'environment=NODE_ENV="production",PORT="5000"' >> /etc/supervisor/supervisord.conf \
    && echo 'autostart=true' >> /etc/supervisor/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisor/supervisord.conf \
    && echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/supervisord.conf \
    && echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/supervisord.conf \
    && echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/supervisord.conf \
    && echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/supervisord.conf

# 创建 supervisor 日志目录
RUN mkdir -p /var/log/supervisor

# ========== 安装 Node.js 依赖（生产） ==========
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm \
    && --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# ========== 复制项目文件 ==========
# Next.js 构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/components.json ./

# PHP 后端
COPY php ./php
COPY sql ./sql

# 上传目录
RUN mkdir -p /app/php/public/uploads /app/php/public/uploads/goods \
    && chown -R nginx:nginx /app/php/public/uploads

# ========== 端口 ==========
EXPOSE 80 443

# ========== 启动 (Supervisor 管理 PHP-FPM + Nginx + Next.js) ==========
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
