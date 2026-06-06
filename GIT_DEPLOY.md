# Git 同步部署指南

## 🚀 快速開始

### 方式一：使用自動部署腳本 (推薦)

1. **上傳腳本到服務器
```bash
scp /workspace/projects/deploy-git.sh root@116.204.135.69:/root/
```

2. **連接服務器並運行
```bash
ssh root@116.204.135.69
# 密碼: X3bNZ3nVc5LH

chmod +x /root/deploy-git.sh
/root/deploy-git.sh
```

就這麼簡單！腳本會自動完成所有部署工作。

---

### 方式二：手動 Git 部署

#### 1. 連接服務器
```bash
ssh root@116.204.135.69
```

#### 2. 安裝必要軟件
```bash
# 更新系統
yum update -y

# 安裝 Git
yum install -y git

# 安裝 Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# 安裝 pnpm
npm install -g pnpm

# 安裝 Nginx
yum install -y nginx
```

#### 3. 克隆項目
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/junnyjchen/fubao.git
cd fubao
```

#### 4. 安裝依賴和構建
```bash
pnpm install
pnpm build
```

#### 5. 配置 systemd 服務
```bash
cat > /etc/systemd/system/fubao.service << 'EOF'
[Unit]
Description=符寶網 - 全球玄門文化科普交易平台
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/fubao
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

#### 6. 配置 Nginx
```bash
cat > /etc/nginx/conf.d/fubao.conf << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 20M;

    access_log /var/log/nginx/fubao-access.log;
    error_log /var/log/nginx/fubao-error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    location /_next/static {
        alias /var/www/fubao/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
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
EOF
```

#### 7. 配置防火牆
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

#### 8. 啟動服務
```bash
# 啟動應用
systemctl start fubao
systemctl enable fubao

# 重啟 Nginx
systemctl restart nginx
systemctl enable nginx
```

---

## 🔄 更新部署更新流程

### 本地開發流程

1. **本地提交代碼
```bash
cd /workspace/projects
git add .
git commit -m "你的提交信息"
git push
```

2. **服務器更新
```bash
ssh root@116.204.135.69
cd /var/www/fubao

# 拉取最新代碼
git pull origin main

# 安裝新依賴（如果有)
pnpm install

# 重新構建
pnpm build

# 重啟服務
systemctl restart fubao
```

---

## 📋 常用命令

### Git 相關
```bash
# 查看狀態
git status

# 查看日誌
git log --oneline

# 創建分支
git checkout -b feature-name

# 切換分支
git checkout main

# 合併分支
git merge feature-name
```

### 服務管理
```bash
# 查看日誌
journalctl -u fubao -f

# 重啟
systemctl restart fubao

# 停止
systemctl stop fubao

# 查看狀態
systemctl status fubao

# Nginx日誌
tail -f /var/log/nginx/fubao-access.log
tail -f /var/log/nginx/fubao-error.log
```

---

## 🔑 測試賬號

- **用戶**: test@example.com / admin123
- **管理員**: admin / admin123

---

## 🌐 訪問地址

部署完成後訪問: **http://116.204.135.69**

---

## ⚠️ 注意事項

1. **首次部署**: 使用自動部署腳本
2. **代碼更新**: 推送代碼後，需要在服務器上執行 `git pull` 和重啟服務
3. **數據備份**: 定期備份數據庫和重要文件
4. **日誌監控**: 定期檢查日誌，確保服務正常運行

---

## 🆘 故障排查

### 服務無法啟動
```bash
# 查看日誌
journalctl -u fubao -n 50

# 檢查端口
netstat -tlnp | grep 3000

# 手動測試
cd /var/www/fubao
pnpm start
```

### Nginx 502 錯誤
```bash
# 檢查 Nginx 配置
nginx -t

# 查看 Nginx 日誌
tail -f /var/log/nginx/fubao-error.log

# 重啟 Nginx
systemctl restart nginx
```
