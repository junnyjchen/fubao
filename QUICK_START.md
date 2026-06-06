
# 快速部署指南

## 📦 部署包已准备好！

已生成部署包：`fubao-deploy-20260606-214829.tar.gz` (1.4 MB)

---

## 🚀 三步完成部署

### 第一步：上傳部署包到服務器
```bash
# 在本地電腦執行
scp /workspace/projects/fubao-deploy-20260606-214829.tar.gz root@116.204.135.69:/root/
```

### 第二步：連接服務器並運行自動部署腳本
```bash
# 1. 連接到服務器
ssh root@116.204.135.69
# 密碼: X3bNZ3nVc5LH

# 2. 上傳自動部署腳本（在本地新開一個終端）
scp /workspace/projects/deploy.sh root@116.204.135.69:/root/

# 3. 回到服務器 SSH，運行部署腳本
chmod +x /root/deploy.sh
/root/deploy.sh
```

### 第三步：完成部署
當自動部署腳本完成後：
```bash
# 1. 解壓項目代碼
cd /var/www/fubao
tar -xzf /root/fubao-deploy-20260606-214829.tar.gz

# 2. 安裝依賴
pnpm install

# 3. 構建項目
pnpm build

# 4. 啟動服務
systemctl start fubao
systemctl enable fubao
systemctl start nginx
systemctl enable nginx
```

---

## ✅ 驗證部署

訪問：`http://116.204.135.69`

---

## 📋 常用命令

### 查看服務狀態
```bash
systemctl status fubao    # 查看應用狀態
systemctl status nginx    # 查看 Nginx 狀態
```

### 查看日誌
```bash
journalctl -u fubao -f               # 實時查看應用日誌
tail -f /var/log/nginx/fubao_*.log  # 查看 Nginx 日誌
```

### 重啟服務
```bash
systemctl restart fubao  # 重啟應用
systemctl restart nginx  # 重啟 Nginx
```

---

## 🔑 測試賬號

- **用戶賬號**: test@example.com / admin123
- **管理員賬號**: admin / admin123

---

## 📚 詳細文檔

如需更詳細的部署說明，請參考：
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整部署指南

