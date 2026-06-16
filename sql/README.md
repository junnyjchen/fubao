# 符寶網 - MySQL 數據庫配置教程

## 方式一：一鍵腳本（推薦）

登入服務器後，執行：

```bash
cd /workspace/projects
bash sql/deploy-mysql.sh
```

腳本會自動完成：安裝MySQL → 創建數據庫 → 建表(15張) → 導入種子數據 → 寫入環境變量

---

## 方式二：手動步驟

### 第1步：登入MySQL

```bash
mysql -u root -p
```

### 第2步：創建數據庫和用戶

```sql
CREATE DATABASE IF NOT EXISTS fubao DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'fubao'@'%' IDENTIFIED BY 'XNmEbBwKKe5HwnNW';
CREATE USER IF NOT EXISTS 'fubao'@'localhost' IDENTIFIED BY 'XNmEbBwKKe5HwnNW';
GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'%';
GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 第3步：建表

```bash
mysql -u fubao -p'XNmEbBwKKe5HwnNW' fubao < /workspace/projects/sql/schema.sql
```

### 第4步：導入種子數據

```bash
mysql -u fubao -p'XNmEbBwKKe5HwnNW' fubao < /workspace/projects/sql/seed.sql
```

### 第5步：配置環境變量

在 `.env` 或 Docker 環境變量中添加：

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=fubao
MYSQL_PASSWORD=XNmEbBwKKe5HwnNW
MYSQL_DATABASE=fubao
```

### 第6步：重啟服務

```bash
# Docker 部署的話
docker restart <容器名>

# 或者重建容器
cd /workspace/projects
docker-compose down && docker-compose up -d
```

---

## 驗證

### 檢查數據庫狀態

```bash
curl http://localhost:5000/api/admin/database
```

返回 `"engine":"mysql"` 即切換成功 ✅

### 也可通過API初始化

```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"action":"init"}' \
  http://localhost:5000/api/admin/database
```

---

## 數據庫信息

| 項目 | 值 |
|------|-----|
| 數據庫名 | fubao |
| 用戶名 | fubao |
| 密碼 | XNmEbBwKKe5HwnNW |
| 主機 | 127.0.0.1 |
| 端口 | 3306 |
| 字符集 | utf8mb4 |

## 常用命令

```bash
# 登入數據庫
mysql -u fubao -p'XNmEbBwKKe5HwnNW' fubao

# 查看所有表
SHOW TABLES;

# 查看商品
SELECT id, name, price, stock FROM goods;

# 查看用戶
SELECT id, email, role FROM users;

# 查看商家
SELECT id, name, login_account FROM merchants;

# 查看設置
SELECT * FROM settings;
```
