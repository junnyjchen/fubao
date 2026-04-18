# 手动部署指南

## 服务器要求

- Ubuntu 20.04+ / CentOS 7+
- 2GB+ RAM
- 20GB+ 磁盘空间

## 一、安装环境

### 1. 安装 Nginx

**Ubuntu:**
```bash
apt update
apt install nginx
systemctl start nginx
systemctl enable nginx
```

**CentOS:**
```bash
yum install epel-release
yum install nginx
systemctl start nginx
systemctl enable nginx
```

### 2. 安装 PHP

**Ubuntu:**
```bash
apt install software-properties-common
add-apt-repository ppa:ondrej/php
apt update
apt install php7.4 php7.4-fpm php7.4-mysql php7.4-json php7.4-curl php7.4-gd php7.4-mbstring php7.4-xml php7.4-zip
```

**CentOS:**
```bash
yum install epel-release
yum install https://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi-php74
yum install php php-fpm php-mysql php-json php-curl php-gd php-mbstring php-xml php-zip
systemctl start php-fpm
systemctl enable php-fpm
```

### 3. 安装 MySQL

**Ubuntu:**
```bash
apt install mysql-server
systemctl start mysql
systemctl enable mysql
mysql_secure_installation
```

**CentOS:**
```bash
yum install mysql-server
systemctl start mysqld
systemctl enable mysqld
```

## 二、配置 PHP-FPM

编辑 `/etc/php/7.4/fpm/pool.d/www.conf`（Ubuntu）或对应文件：

```bash
# 找到并修改
listen = /var/run/php/php-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
```

重启 PHP-FPM：
```bash
systemctl restart php7.4-fpm  # Ubuntu
systemctl restart php-fpm     # CentOS
```

## 三、配置 Nginx

创建 `/etc/nginx/sites-available/fubao-api`:

```nginx
server {
    listen 80;
    server_name api.fubao.com;  # 替换为你的域名
    root /var/www/fubao-api/public;
    index index.php index.html;

    # 日志
    access_log /var/log/nginx/fubao_access.log;
    error_log /var/log/nginx/fubao_error.log;

    # GZIP
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # 伪静态
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP 处理
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 安全
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(env|log|sql)$ {
        deny all;
    }
}
```

启用站点：
```bash
ln -s /etc/nginx/sites-available/fubao-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 四、部署 PHP 后端

### 1. 创建目录

```bash
mkdir -p /var/www/fubao-api
```

### 2. 上传代码

使用 SCP 或其他方式上传：

```bash
scp -r ./php/* root@your-server:/var/www/fubao-api/
```

### 3. 设置权限

```bash
chown -R www-data:www-data /var/www/fubao-api
chmod -R 755 /var/www/fubao-api
chmod 644 /var/www/fubao-api/public/.htaccess
```

### 4. 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE fubao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fubao'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. 导入数据

```bash
mysql -u fubao -p fubao < /var/www/fubao-api/scripts/mysql-migration.sql
```

### 6. 修改配置

编辑 `/var/www/fubao-api/config/database.php`:

```php
return [
    'type' => 'mysql',
    'hostname' => 'localhost',
    'database' => 'fubao',
    'username' => 'fubao',
    'password' => 'your_password',
    'hostport' => '3306',
    'charset' => 'utf8mb4',
];
```

编辑 `/var/www/fubao-api/config/app.php`:

```php
'jwt_secret' => 'your_random_secret_key',
```

## 五、部署前端 Next.js

### 1. 安装 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v  # 确认版本
```

### 2. 安装 PM2

```bash
npm install -g pm2
```

### 3. 上传前端代码

```bash
scp -r ./fubao-web/* root@your-server:/var/www/fubao-web/
```

### 4. 安装依赖并构建

```bash
cd /var/www/fubao-web
npm install
npm run build
```

### 5. 配置环境变量

创建 `.env.production`:

```bash
NEXT_PUBLIC_API_MODE=remote
NEXT_PUBLIC_API_URL=https://api.fubao.com
```

### 6. 启动服务

```bash
pm2 start npm --name "fubao-web" -- start
pm2 save
pm2 startup
```

## 六、配置 SSL

使用 Let's Encrypt 免费证书：

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d api.fubao.com
certbot --nginx -d www.fubao.com
```

自动续期：
```bash
systemctl enable certbot.timer
```

## 七、验证

```bash
# 测试 API
curl http://localhost/api/health

# 测试管理员登录
curl -X POST http://localhost/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 八、目录结构

```
/var/www/
├── fubao-api/           # PHP 后端
│   ├── public/          # 网站根目录
│   ├── app/             # 应用代码
│   ├── config/          # 配置
│   └── scripts/          # 脚本
└── fubao-web/           # 前端
    ├── .next/           # 构建产物
    └── src/             # 源码
```

## 九、常用命令

```bash
# PHP 后端日志
tail -f /var/log/nginx/fubao_error.log

# PHP-FPM 日志
tail -f /var/log/php7.4-fpm.log

# 重启服务
systemctl restart nginx
systemctl restart php7.4-fpm

# PM2 管理
pm2 status
pm2 logs fubao-web
pm2 restart fubao-web
```

## 十、登录信息

| 项目 | 默认值 |
|------|--------|
| 管理员用户名 | admin |
| 管理员密码 | admin123 |

**⚠️ 部署后请立即修改默认密码！**
