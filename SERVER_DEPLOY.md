# 服务器部署命令

## 在服务器上执行以下命令

### 1. 创建网站目录
```bash
mkdir -p /www/wwwroot/fubao-api
```

### 2. 克隆代码（或手动上传）
```bash
cd /www/wwwroot
git clone https://github.com/junnyjchen/fubao.git
mv fubao/php /www/wwwroot/fubao-api
rm -rf fubao
```

### 3. 设置权限
```bash
chown -R www:www /www/wwwroot/fubao-api
chmod -R 755 /www/wwwroot/fubao-api
```

### 4. 创建数据库
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fubao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p fubao < /www/wwwroot/fubao-api/scripts/mysql-migration.sql
```

### 5. 修改配置文件
编辑 `/www/wwwroot/fubao-api/config/database.php`，修改数据库密码

编辑 `/www/wwwroot/fubao-api/config/app.php`，修改 JWT 密钥

### 6. 宝塔面板配置
1. 添加网站，根目录选择 `/www/wwwroot/fubao-api/public`
2. 设置 → 伪静态 → 选择 `thinkphp`
3. 设置 → SSL → 配置证书（可选）

### 7. 验证部署
```bash
curl http://localhost/api/health
```

---

## 默认登录信息

| 项目 | 值 |
|------|-----|
| 用户名 | admin |
| 密码 | admin123 |

**⚠️ 部署后请立即修改默认密码！**
