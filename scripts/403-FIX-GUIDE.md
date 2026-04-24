# 符寶網 - 403 错误修复指南

## 问题原因

403 Forbidden 错误通常由以下原因造成：

1. **目录权限不足** - Nginx/PHP 无法读取文件
2. **文件所有者错误** - www-data 用户无法访问文件
3. **Nginx 配置错误** - root 路径指向错误目录
4. **SELinux/AppArmor** - 安全策略阻止访问
5. **.htaccess 冲突** - Nginx 不支持 Apache 的 .htaccess

## 快速修复命令

在服务器终端执行以下命令：

```bash
# 1. 进入项目目录
cd /www/wwwroot/fubao

# 2. 设置正确的文件所有者 (宝塔用 www:www)
chown -R www:www /www/wwwroot/fubao

# 3. 设置目录权限
find /www/wwwroot/fubao -type d -exec chmod 755 {} \;

# 4. 设置文件权限
find /www/wwwroot/fubao -type f -exec chmod 644 {} \;

# 5. 确保 Next.js 构建文件存在
ls -la /www/wwwroot/fubao/.next 2>/dev/null || echo "需要构建!"

# 6. 测试 Nginx 配置
nginx -t

# 7. 重载 Nginx
systemctl reload nginx
```

## 完整部署流程

### 方式一: 使用宝塔面板

1. 打开宝塔面板
2. 进入 `/www/wwwroot/fubao` 目录
3. 打开终端，执行：
```bash
cd /www/wwwroot/fubao
git pull origin main
npm install
npm run build
chown -R www:www /www/wwwroot/fubao
```

### 方式二: SSH 连接

```bash
# 连接服务器
ssh root@47.76.186.195

# 进入目录
cd /www/wwwroot/fubao

# 拉取代码
git pull origin main

# 安装依赖
npm install

# 构建
npm run build

# 修复权限
chown -R www:www /www/wwwroot/fubao
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# 重启 Nginx
systemctl reload nginx
```

## 验证部署

```bash
# 检查目录结构
ls -la /www/wwwroot/fubao/

# 检查 Next.js 构建
ls -la /www/wwwroot/fubao/.next/

# 测试访问
curl -I http://47.76.186.195
```

## Nginx 配置检查

确认 `/etc/nginx/sites-available/fubao` 或宝塔站点配置中：

```nginx
server {
    listen 80;
    server_name 47.76.186.195;
    root /www/wwwroot/fubao;  # 确保路径正确
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 如果使用 PM2 运行 Next.js

```bash
# 检查 PM2 状态
pm2 status

# 重启服务
pm2 restart fubao

# 查看日志
pm2 logs fubao
```

## 如果直接运行 Node

```bash
# 杀掉旧进程
pkill -f "next"

# 后台启动
cd /www/wwwroot/fubao
nohup npm run start > /var/log/fubao.log 2>&1 &

# 检查状态
curl -I http://localhost:5000
```
