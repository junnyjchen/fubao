
# 符寶網 - CentOS 部署指南

## 服務器信息
- **IP 地址**: 116.204.135.69
- **用戶名**: root
- **密碼**: X3bNZ3nVc5LH
- **端口**: 22
- **操作系統**: CentOS

## 部署步驟

### 方法一：使用自動部署腳本（推薦）

#### 1. 連接到服務器
```bash
ssh root@116.204.135.69
# 輸入密碼: X3bNZ3nVc5LH
```

#### 2. 上傳部署腳本
在你的本地電腦上執行（新開一個終端）：
```bash
scp /workspace/projects/deploy.sh root@116.204.135.69:/root/
```

#### 3. 在服務器上運行部署腳本
```bash
# 回到服務器 SSH 會話
chmod +x /root/deploy.sh
/root/deploy.sh
```

#### 4. 上傳項目代碼
等待腳本完成後，上傳項目代碼：
```bash
# 在本地電腦上執行（需要壓縮項目）
cd /workspace/projects
tar -czf fubao.tar.gz --exclude='node_modules' --exclude='.next' .
scp fubao.tar.gz root@116.204.135.69:/var/www/fubao/

# 在服務器上解壓
ssh root@116.204.135.69
cd /var/www/fubao
tar -xzf fubao.tar.gz
rm fubao.tar.gz
```

#### 5. 安裝依賴並構建
```bash
cd /var/www/fubao
pnpm install
pnpm build
```

#### 6. 啟動服務
```bash
# 啟動 Next.js 應用
systemctl start fubao
systemctl enable fubao  # 開機自啟

# 啟動 Nginx
systemctl start nginx
systemctl enable nginx
```

#### 7. 驗證部署
訪問 `http://116.204.135.69` 查看網站是否正常運行。

---

### 方法二：手動部署

#### 1. 連接服務器
```bash
ssh root@116.204.135.69
```

#### 2. 系統更新
```bash
yum update -y
```

#### 3. 安裝必要軟件
```bash
yum install -y curl wget git vim nginx
```

#### 4. 安裝 Node.js
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
node -v  # 驗證安裝
```

#### 5. 安裝 pnpm
```bash
npm install -g pnpm
pnpm -v  # 驗證安裝
```

#### 6. 創建應用目錄
```bash
mkdir -p /var/www/fubao
cd /var/www/fubao
```

#### 7. 上傳代碼
在本地壓縮並上傳：
```bash
# 本地執行
cd /workspace/projects
tar -czf fubao.tar.gz --exclude='node_modules' --exclude='.next' .
scp fubao.tar.gz root@116.204.135.69:/var/www/fubao/

# 服務器上解壓
cd /var/www/fubao
tar -xzf fubao.tar.gz
rm fubao.tar.gz
```

#### 8. 安裝依賴
```bash
cd /var/www/fubao
pnpm install
```

#### 9. 構建生產版本
```bash
pnpm build
```

#### 10. 配置 Nginx
創建 Nginx 配置文件 `/etc/nginx/conf.d/fubao.conf`：
```nginx
server {
    listen 80;
    server_name _;
    
    access_log /var/log/nginx/fubao_access.log;
    error_log /var/log/nginx/fubao_error.log;
    
    # 靜態資源
    location /_next/static {
        alias /var/www/fubao/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /static {
        alias /var/www/fubao/public/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 反向代理
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

測試 Nginx 配置：
```bash
nginx -t
```

#### 11. 創建 systemd 服務
創建文件 `/etc/systemd/system/fubao.service`：
```ini
[Unit]
Description=符寶網 - Next.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/fubao
Environment=NODE_ENV=production
Environment=DEPLOY_RUN_PORT=5000
Environment=COZE_PROJECT_ENV=PROD
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

重載 systemd：
```bash
systemctl daemon-reload
```

#### 12. 啟動服務
```bash
# 啟動應用
systemctl start fubao
systemctl enable fubao

# 啟動 Nginx
systemctl start nginx
systemctl enable nginx
```

#### 13. 配置防火牆（如需要）
```bash
# 如果使用 firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

---

## 常用管理命令

### 查看服務狀態
```bash
# 查看應用狀態
systemctl status fubao

# 查看 Nginx 狀態
systemctl status nginx
```

### 查看日誌
```bash
# 應用日誌
journalctl -u fubao -f

# Nginx 日誌
tail -f /var/log/nginx/fubao_access.log
tail -f /var/log/nginx/fubao_error.log
```

### 重啟服務
```bash
# 重啟應用
systemctl restart fubao

# 重啟 Nginx
systemctl restart nginx
```

### 停止服務
```bash
systemctl stop fubao
systemctl stop nginx
```

---

## 更新部署

當你需要更新代碼時：

```bash
# 1. 本地壓縮新代碼
cd /workspace/projects
tar -czf fubao-update.tar.gz --exclude='node_modules' --exclude='.next' .

# 2. 上傳到服務器
scp fubao-update.tar.gz root@116.204.135.69:/var/www/fubao/

# 3. 在服務器上更新
ssh root@116.204.135.69
cd /var/www/fubao

# 4. 停止服務
systemctl stop fubao

# 5. 備份當前版本（可選）
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# 6. 解壓新代碼
tar -xzf fubao-update.tar.gz
rm fubao-update.tar.gz

# 7. 安裝新依賴（如有）
pnpm install

# 8. 重新構建
pnpm build

# 9. 啟動服務
systemctl start fubao
```

---

## 故障排查

### 問題：網站無法訪問
1. 檢查服務是否運行：
   ```bash
   systemctl status fubao
   systemctl status nginx
   ```

2. 檢查端口是否監聽：
   ```bash
   ss -tuln | grep -E ':(80|5000)'
   ```

3. 查看日誌：
   ```bash
   journalctl -u fubao -n 50
   tail -n 50 /var/log/nginx/fubao_error.log
   ```

### 問題：502 Bad Gateway
這通常表示 Next.js 應用沒有運行：
1. 檢查應用狀態：`systemctl status fubao`
2. 查看應用日誌：`journalctl -u fubao -f`
3. 重啟應用：`systemctl restart fubao`

### 問題：SELinux 阻止訪問
如果 SELinux 處於 Enforcing 模式，可能需要臨時關閉：
```bash
setenforce 0
```

---

## 安全建議

1. **修改 root 密碼**（首次登錄後）
   ```bash
   passwd
   ```

2. **配置防火牆**，只開放必要端口
3. **定期更新系統**
   ```bash
   yum update -y
   ```
4. **配置 SSL 證書**（使用 Let's Encrypt）
5. **禁用 root 遠程登錄**（創建普通用戶後）

---

## 測試賬號

- **用戶賬號**: test@example.com / admin123
- **管理員賬號**: admin / admin123

