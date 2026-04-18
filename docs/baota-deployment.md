# 宝塔面板部署指南

## 服务器信息

- IP: 47.76.186.195
- 面板端口: 8888

## 一、前置准备

### 1. 安装必要软件

在宝塔面板「软件商店」中安装：
- **Nginx** - Web 服务器
- **PHP 7.4+** - PHP 环境
- **MySQL 5.7+** - 数据库
- **phpMyAdmin** - 数据库管理（可选）

### 2. 创建数据库

1. 进入宝塔面板 → 「数据库」
2. 点击「添加数据库」
3. 填写信息：
   - 数据库名：`fubao`
   - 用户名：`fubao`
   - 密码：设置一个强密码
   - 编码：`utf8mb4`

## 二、部署 PHP 后端 API

### 1. 创建网站

1. 进入宝塔面板 → 「网站」
2. 点击「添加站点」
3. 填写信息：
   - 域名：填写你的域名（如 `api.fubao.com`）或留空使用 IP
   - 根目录：`/www/wwwroot/fubao-api/public`
   - PHP 版本：选择 7.4 或 8.0

### 2. 上传代码

**方式一：Git 克隆**
```bash
# SSH 连接到服务器
ssh root@47.76.186.195

# 进入网站目录
cd /www/wwwroot

# 克隆代码
git clone https://github.com/junnyjchen/fubao.git

# 移动 PHP 后端到网站目录
mv fubao/php /www/wwwroot/fubao-api

# 清理
rm -rf fubao
```

**方式二：直接上传**
1. 使用宝塔文件管理器上传 `php/` 目录
2. 将内容解压到 `/www/wwwroot/fubao-api/public/`

### 3. 设置目录权限

```bash
chown -R www:www /www/wwwroot/fubao-api
chmod -R 755 /www/wwwroot/fubao-api
chmod 644 /www/wwwroot/fubao-api/public/.htaccess
```

### 4. 导入数据库

1. 在宝塔面板 → 「数据库」
2. 点击 `fubao` 数据库的「管理」按钮
3. 进入 phpMyAdmin
4. 点击「导入」→ 选择文件
5. 选择 `/www/wwwroot/fubao-api/scripts/mysql-migration.sql`
6. 点击「执行」

### 5. 修改配置

编辑 `/www/wwwroot/fubao-api/config/database.php`：

```php
return [
    'type' => 'mysql',
    'hostname' => '127.0.0.1',
    'database' => 'fubao',
    'username' => 'fubao',
    'password' => '你的数据库密码',
    'hostport' => '3306',
    'charset' => 'utf8mb4',
];
```

编辑 `/www/wwwroot/fubao-api/config/app.php`：

```php
'jwt_secret' => '随机密钥',
```

### 6. 配置伪静态

1. 在宝塔面板 → 「网站」
2. 点击 `fubao-api` 的「设置」
3. 选择「伪静态」
4. 选择 `thinkphp`
5. 点击「保存」

### 7. 配置 SSL（推荐）

1. 在宝塔面板 → 「网站」
2. 点击 `fubao-api` 的「设置」
3. 选择「SSL」
4. 选择「Let's Encrypt」或上传已有证书
5. 开启「强制HTTPS」

## 三、部署前端 Next.js

### 1. 修改 API 地址

编辑 `src/lib/api-config.ts` 或设置环境变量：

```bash
NEXT_PUBLIC_API_MODE=remote
NEXT_PUBLIC_API_URL=https://api.fubao.com
```

### 2. 构建项目

```bash
# 本地执行构建
pnpm build

# 将 .next 目录上传到服务器
```

### 3. 创建前端网站

1. 在宝塔面板 → 「网站」
2. 点击「添加站点」
3. 填写信息：
   - 域名：填写你的域名（如 `www.fubao.com`）
   - 根目录：`/www/wwwroot/fubao-web/.next`
   - PHP 版本：不需要 PHP，选择「纯静态」

### 4. 配置 Next.js 运行环境

由于 Next.js 需要 Node.js 运行环境，使用 PM2 管理：

```bash
# SSH 连接到服务器
ssh root@47.76.186.195

# 安装 Node.js（如果没有）
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 进入前端目录
cd /www/wwwroot/fubao-web

# 安装依赖
npm install

# 启动服务
pm2 start npm --name "fubao-web" -- start

# 设置开机自启
pm2 save
pm2 startup
```

## 四、验证部署

### 健康检查

```bash
curl https://api.fubao.com/api/health
```

预期响应：
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": 1234567890
}
```

### 测试管理员登录

```bash
curl -X POST https://api.fubao.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 五、目录结构

部署后的目录结构：

```
/www/wwwroot/
├── fubao-api/           # PHP 后端 API
│   ├── public/         # 网站根目录
│   ├── app/           # 应用代码
│   ├── config/        # 配置文件
│   └── scripts/       # 数据库脚本
└── fubao-web/          # 前端 Next.js
    ├── .next/         # 构建产物
    └── src/           # 源码
```

## 六、常见问题

### 1. 500 Internal Server Error

- 检查 PHP 错误日志
- 确认 `.htaccess` 文件存在
- 检查目录权限

### 2. 数据库连接失败

```bash
# 检查 MySQL 服务状态
systemctl status mysqld

# 检查数据库配置
cat /www/wwwroot/fubao-api/config/database.php
```

### 3. API 返回 404

- 确认伪静态规则已生效
- 确认网站目录指向 `public/`

### 4. 权限问题

```bash
chown -R www:www /www/wwwroot/fubao-api
chmod -R 755 /www/wwwroot/fubao-api
```

## 七、安全建议

1. **修改默认密码**：立即修改管理员密码
2. **配置 SSL**：使用 HTTPS 加密传输
3. **设置防火墙**：只开放必要端口（80, 443, 22）
4. **定期备份**：设置数据库自动备份
