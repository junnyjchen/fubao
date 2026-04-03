# 宝塔面板部署指南

## 面板信息
- 外网地址: https://47.76.186.195:21500/49918664
- 内网地址: https://172.20.218.237:21500/49918664
- 用户名: prd0bdif
- 密码: fe256418

---

## 步骤一：删除旧站点

### 1. 登录宝塔面板
打开浏览器访问面板地址，输入用户名和密码登录。

### 2. 进入网站管理
- 左侧菜单点击「网站」
- 找到需要删除的站点

### 3. 删除站点
1. 点击站点右侧的「删除」按钮
2. 选择「删除数据库」（如果有）
3. 确认删除

### 4. 清理文件（可选）
1. 进入「文件」管理
2. 找到网站根目录（通常在 `/www/wwwroot/` 下）
3. 删除对应站点文件夹

---

## 步骤二：准备部署文件

### 1. 安装 Node.js 环境
1. 在宝塔面板中，进入「软件商店」
2. 搜索并安装「Node.js 版本管理器」
3. 安装 Node.js 20.x 版本

### 2. 创建站点
1. 点击「网站」→「添加站点」
2. 填写域名（如果没有域名，使用服务器IP）
3. 数据库选择「MySQL」或「不创建」（根据需要）
4. PHP版本选择「纯静态」
5. 点击「提交」

### 3. 安装 PM2 管理器
1. 进入「软件商店」
2. 搜索「PM2管理器」
3. 点击「安装」

---

## 步骤三：上传并部署项目

### 方法一：使用宝塔文件上传（推荐）

#### 1. 上传构建包
1. 进入「文件」管理
2. 找到新建站点的根目录（如 `/www/wwwroot/your-site.com`）
3. 将本项目的所有文件上传到此目录

#### 2. 安装依赖
1. 在文件管理中，右键点击站点根目录
2. 选择「打开终端」
3. 执行以下命令：

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install

# 构建项目
pnpm build
```

### 方法二：使用 Git 部署（推荐）

#### 1. 在宝塔安装 Git
1. 进入「软件商店」
2. 搜索「Git」
3. 点击「安装」

#### 2. 克隆项目
在终端执行：
```bash
cd /www/wwwroot/your-site.com
git clone <your-repo-url> .
pnpm install
pnpm build
```

---

## 步骤四：配置环境变量

### 1. 创建环境变量文件
在宝塔文件管理中，创建 `.env.local` 文件：

```bash
# Supabase 配置
COZE_SUPABASE_URL=你的Supabase_URL
COZE_SUPABASE_ANON_KEY=你的Supabase_ANON_KEY

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://你的域名或IP
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥（生成一个安全的密钥）
JWT_SECRET=your-jwt-secret-key-here
```

### 2. 设置文件权限
在终端执行：
```bash
chmod 600 /www/wwwroot/your-site.com/.env.local
```

---

## 步骤五：使用 PM2 启动应用

### 1. 在宝塔中添加项目
1. 进入「软件商店」→「PM2管理器」
2. 点击「添加项目」

### 2. 填写项目信息
- **项目名称**: fubao-net（或自定义）
- **项目目录**: `/www/wwwroot/your-site.com`
- **启动文件**: `node dist/server.js`
- **项目端口**: `5000`
- **运行环境**: Node.js 20.x

### 3. 点击「提交」启动项目

---

## 步骤六：配置 Nginx 反向代理

### 1. 进入站点设置
1. 在「网站」列表中找到新站点
2. 点击「设置」→「配置文件」

### 2. 修改 Nginx 配置
将配置修改为：

```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为你的域名或IP

    # 日志
    access_log /www/wwwroot/your-site.com/access.log;
    error_log /www/wwwroot/your-site.com/error.log;

    # 反向代理到 PM2 应用
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location /static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 保存并重载配置
点击「保存」后，在终端执行：
```bash
nginx -t && nginx -s reload
```

---

## 步骤七：配置 SSL 证书（可选但推荐）

### 1. 进入 SSL 设置
1. 在「网站」列表中点击站点「设置」
2. 选择「SSL」选项卡

### 2. 申请 Let's Encrypt 免费证书
1. 选择「Let's Encrypt」
2. 填写邮箱地址
3. 勾选域名
4. 点击「申请」

### 3. 启用强制 HTTPS
勾选「强制HTTPS」，自动将HTTP请求重定向到HTTPS

---

## 步骤八：验证部署

### 1. 检查 PM2 状态
在「PM2管理器」中查看应用状态，确保状态为「运行中」。

### 2. 访问网站
在浏览器中访问：
- http://你的域名或IP

### 3. 检查日志
如果访问失败，查看日志：
1. PM2日志：在「PM2管理器」中查看应用日志
2. Nginx日志：在 `/www/wwwroot/your-site.com/` 下查看 error.log

---

## 常见问题排查

### 1. 端口被占用
```bash
# 查看端口占用
netstat -tunlp | grep 5000

# 如果被占用，杀掉进程
kill -9 <PID>
```

### 2. 权限问题
```bash
# 设置正确的文件权限
chown -R www:www /www/wwwroot/your-site.com
chmod -R 755 /www/wwwroot/your-site.com
```

### 3. 依赖安装失败
```bash
# 清除缓存重试
pnpm store prune
pnpm install
```

### 4. 数据库连接失败
检查 `.env.local` 中的数据库配置是否正确。

---

## 步骤九：配置自动部署（可选）

### 1. 在宝塔设置 Git Webhook
1. 进入「软件商店」→「Git」
2. 点击「配置」→「Webhook」
3. 设置 Webhook URL

### 2. 创建部署脚本
在项目根目录创建 `deploy.sh`：

```bash
#!/bin/bash
cd /www/wwwroot/your-site.com
git pull
pnpm install
pnpm build
pm2 restart fubao-net
```

### 3. 在 Git 平台配置 Webhook
将宝塔生成的 Webhook URL 配置到 Git 仓库的 Webhook 设置中。

---

## 联系与支持

如果遇到问题，请检查：
1. 宝塔面板日志：面板→「面板设置」→「日志」
2. PM2 应用日志：面板→「软件商店」→「PM2管理器」→应用日志
3. Nginx 错误日志：`/www/wwwroot/your-site.com/error.log`
