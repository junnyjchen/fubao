# 符寶網 - 快速部署指南

## 服务器信息

**IP**: 47.76.186.195

---

## 一、上传代码

### 方法1: 使用 SCP 上传

```bash
# 在本地执行，将整个 php 目录上传到服务器
scp -r ./php/* root@47.76.186.195:/www/wwwroot/fubao-api/
```

### 方法2: 使用宝塔面板

1. 登录宝塔面板: http://47.76.186.195:8888
2. 文件 → /www/wwwroot
3. 新建目录 `fubao-api`
4. 上传本地的 `php/` 目录下的所有文件

---

## 二、配置网站（宝塔面板）

1. **添加网站**
   - 域名：填写你的域名或 `api.your-domain.com`
   - 根目录：`/www/wwwroot/fubao-api/public`
   - PHP版本：选择 7.4 或 8.0

2. **设置伪静态**
   - 网站 → 设置 → 伪静态
   - 选择 `thinkphp`
   - 保存

3. **设置网站目录**
   - 网站 → 设置 → 基本设置
   - 网站目录：改为 `/www/wwwroot/fubao-api/public`
   - 勾选「禁止访问 .htaccess」（如果提示）

4. **配置 SSL（推荐）**
   - 网站 → 设置 → SSL
   - Let's Encrypt 免费证书 或 上传已有证书

5. **设置目录权限**
   ```
   chmod -R 755 /www/wwwroot/fubao-api
   chown -R www:www /www/wwwroot/fubao-api
   ```

---

## 三、创建数据库

### 方式1: 宝塔面板

1. 数据库 → 添加数据库
   - 数据库名：`fubao`
   - 用户名：`fubao`（或使用 root）
   - 密码：设置一个强密码

2. 导入数据库
   - 点击管理
   - 导入 → 选择文件
   - 文件：`/www/wwwroot/fubao-api/scripts/mysql-migration.sql`

### 方式2: SSH 命令行

```bash
# SSH 连接到服务器
ssh root@47.76.186.195

# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE fubao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 导入数据
mysql -u root -p fubao < /www/wwwroot/fubao-api/scripts/mysql-migration.sql
```

---

## 四、修改配置文件

### 1. 数据库配置

编辑 `/www/wwwroot/fubao-api/config/database.php`：

```php
return [
    'type' => 'mysql',
    'hostname' => '127.0.0.1',
    'database' => 'fubao',
    'username' => 'fubao',  // 你的数据库用户名
    'password' => 'your_password',  // 你的数据库密码
    'hostport' => '3306',
    'charset' => 'utf8mb4',
];
```

### 2. 修改 JWT 密钥

编辑 `/www/wwwroot/fubao-api/config/app.php`：

```php
'jwt_secret' => '随机字符串',  // 修改为安全的随机字符串
```

生成随机密钥：
```bash
head -c 32 /dev/urandom | base64
```

---

## 五、修改默认管理员密码

### 方式1: SQL 命令

```bash
mysql -u root -p fubao
```

```sql
-- 生成新密码哈希
UPDATE admin_users 
SET password = '$2y$10$YOUR_NEW_PASSWORD_HASH' 
WHERE username = 'admin';

-- 或使用 PHP 生成哈希后更新
```

### 方式2: 创建临时脚本

在 `/www/wwwroot/fubao-api/public/` 创建 `reset-admin.php`：

```php
<?php
require __DIR__ . '/../vendor/autoload.php';

$pdo = new PDO('mysql:host=localhost;dbname=fubao', 'root', 'your_password');
$hash = password_hash('YourNewPassword123', PASSWORD_DEFAULT);
$pdo->exec("UPDATE admin_users SET password='$hash' WHERE username='admin'");
echo "Password updated!";
```

访问 `http://your-domain.com/reset-admin.php` 后删除此文件。

---

## 六、验证部署

### 1. 健康检查

浏览器访问：
```
http://api.your-domain.com/api/health
```

或使用命令行：
```bash
curl http://127.0.0.1:8080/api/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "database": "connected"
}
```

### 2. 测试登录

```bash
curl -X POST http://api.your-domain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

预期响应：
```json
{
  "code": 0,
  "message": "登錄成功",
  "data": {
    "admin": {...},
    "token": "eyJ..."
  }
}
```

---

## 七、Nginx 配置参考

如果使用宝塔面板，伪静态规则会自动配置。如果需要手动配置：

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    root /www/wwwroot/fubao-api/public;
    index index.php index.html;

    # 伪静态
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP 处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 安全
    location ~ /\. {
        deny all;
    }
}
```

---

## 常见问题

### 1. 500 Internal Server Error

- 检查 PHP 错误日志
- 确认 `.htaccess` 文件存在
- 检查目录权限

### 2. 数据库连接失败

- 确认数据库服务运行：`systemctl status mysqld`
- 检查用户名密码
- 检查防火墙：`firewall-cmd --list-ports`

### 3. API 返回 404

- 确认伪静态生效
- 确认网站目录指向 `public/`

### 4. 权限问题

```bash
chown -R www:www /www/wwwroot/fubao-api
chmod -R 755 /www/wwwroot/fubao-api
chmod 644 /www/wwwroot/fubao-api/public/.htaccess
```

---

## 登录信息

| 项目 | 值 |
|------|-----|
| 管理后台 | http://api.your-domain.com/admin |
| 默认用户名 | admin |
| 默认密码 | admin123 |

**⚠️ 生产环境请立即修改默认密码！**
