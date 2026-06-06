#!/bin/bash
# ============================================
# 符寶網 - 服務器快速更新腳本
# ============================================
# 用於在服務器上快速拉取最新代碼並更新
# ============================================

set -e

# 顏色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}符寶網 - 快速更新腳本${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# 進入項目目錄
cd /var/www/fubao

# 拉取最新代碼
echo -e "${BLUE}[1/5]${NC} 拉取最新代碼..."
git pull origin main
echo -e "${GREEN}✓ 代碼已更新${NC}"
echo ""

# 安裝依賴
echo -e "${BLUE}[2/5]${NC} 安裝依賴..."
pnpm install
echo -e "${GREEN}✓ 依賴安裝完成${NC}"
echo ""

# 構建項目
echo -e "${BLUE}[3/5]${NC} 構建項目..."
pnpm build
echo -e "${GREEN}✓ 項目構建完成${NC}"
echo ""

# 重啟服務
echo -e "${BLUE}[4/5]${NC} 重啟服務..."
systemctl restart fubao
echo -e "${GREEN}✓ 服務已重啟${NC}"
echo ""

# 檢查狀態
echo -e "${BLUE}[5/5]${NC} 檢查狀態..."
sleep 3
if systemctl is-active --quiet fubao; then
    echo -e "${GREEN}✓ 服務運行正常${NC}"
else
    echo -e "${RED}✗ 服務啟動失敗${NC}"
    journalctl -u fubao -n 20 --no-pager
    exit 1
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✓ 更新完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "查看日誌: journalctl -u fubao -f"
echo ""
