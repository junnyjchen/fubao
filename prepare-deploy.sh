#!/bin/bash

# ============================================
# 符寶網 - 部署準備腳本
# 用於本地打包項目，準備上傳到服務器
# ============================================

set -e

echo "============================================"
echo "符寶網 - 部署準備腳本"
echo "============================================"

# 項目根目錄
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 輸出文件名
OUTPUT_FILE="fubao-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "項目目錄: $PROJECT_DIR"
echo "輸出文件: $OUTPUT_FILE"
echo ""

# 清理舊的構建文件
echo "步驟 1: 清理舊的構建文件..."
rm -rf .next
rm -rf node_modules/.cache
echo "  ✓ 完成"

# 檢查是否有 package.json
if [ ! -f "package.json" ]; then
    echo "錯誤: 找不到 package.json 文件"
    exit 1
fi

# 創建壓縮包
echo ""
echo "步驟 2: 創建部署壓縮包..."
tar -czf "$OUTPUT_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='fubao-deploy-*.tar.gz' \
    --exclude='deploy.sh' \
    --exclude='prepare-deploy.sh' \
    .

# 檢查壓縮是否成功
if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "  ✓ 壓縮包創建成功: $OUTPUT_FILE ($FILE_SIZE)"
else
    echo "  ✗ 壓縮包創建失敗"
    exit 1
fi

echo ""
echo "============================================"
echo "部署準備完成！"
echo "============================================"
echo ""
echo "下一步操作："
echo ""
echo "1. 上傳壓縮包到服務器："
echo "   scp $OUTPUT_FILE root@116.204.135.69:/var/www/fubao/"
echo ""
echo "2. 連接到服務器："
echo "   ssh root@116.204.135.69"
echo ""
echo "3. 在服務器上解壓並部署："
echo "   cd /var/www/fubao"
echo "   tar -xzf $OUTPUT_FILE"
echo "   rm $OUTPUT_FILE"
echo "   pnpm install"
echo "   pnpm build"
echo "   systemctl restart fubao"
echo ""
echo "詳細說明請參考 DEPLOYMENT.md 文件"
echo ""

