#!/bin/bash
# ============================================================
# 符寶網 - CentOS 7 PHP 环境一键安装/检测脚本
# 用途：在宿主机安装 PHP 7.4 + 必需扩展（兼容宝塔面板）
#
# 使用方法：
#   bash php/install-php-centos7.sh          # 检测当前环境
#   bash php/install-php-centos7.sh --install # 自动安装缺失组件
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

log_pass() { echo -e "${GREEN}✅ $1${NC}"; ((PASS_COUNT++)); }
log_fail() { echo -e "${RED}❌ $1${NC}"; ((FAIL_COUNT++)); }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; ((WARN_COUNT++)); }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# ============================================================
echo ""
echo "=============================================="
echo "  符寶網 PHP 环境检测"
echo "  系统: $(cat /etc/redhat-release 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME)"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="
echo ""

# ---- 1. PHP 版本 ----
echo "--- [1] PHP 版本 ---"
if command -v php &>/dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_VERSION;' 2>/dev/null)
    PHP_MAJOR=$(php -r 'echo PHP_MAJOR_VERSION;' 2>/dev/null)
    log_info "已安装: PHP $PHP_VERSION (路径: $(which php))"

    if [ "$PHP_MAJOR" -ge 8 ]; then
        log_pass "PHP 版本 $PHP_VERSION >= 8.0 ✨"
    elif [ "$PHP_MAJOR" -eq 7 ]; then
        PHP_MINOR=$(php -r 'echo PHP_MINOR_VERSION;' 2>/dev/null)
        if [ "$PHP_MINOR" -ge 4 ]; then
            log_pass "PHP 版本 $PHP_VERSION >= 7.4 (可用)"
            log_warn "建议升级到 PHP 8.0+ 获得更好性能和类型支持"
        else
            log_fail "PHP 版本 $PHP_VERSION < 7.4 (过低，需要升级)"
        fi
    else
        log_fail "PHP 版本 $PHP_VERSION (不兼容，需要 >= 7.4)"
    fi
else
    log_fail "未安装 PHP"
fi

# ---- 2. 必需扩展检测 ----
echo ""
echo "--- [2] 必需扩展 (9个) ---"
REQUIRED_EXTENSIONS="pdo pdo_mysql json mbstring openssl curl hash session fileinfo"

for ext in $REQUIRED_EXTENSIONS; do
    if php -m 2>/dev/null | grep -qi "^${ext}$\|^${ext} "; then
        log_pass "$ext ✓"
    else
        log_fail "$ext ✗ (必需)"
    fi
done

# ---- 3. 推荐扩展检测 ----
echo ""
echo "--- [3] 推荐扩展 (7个) ---"
RECOMMENDED_EXTENSIONS="gd opcache zip bcmath xml simplexml redis"

for ext in $RECOMMENDED_EXTENSIONS; do
    if php -m 2>/dev/null | grep -qi "^${ext}$\|^${ext} "; then
        log_pass "$ext ✓"
    else
        log_warn "$ext (推荐但非必需)"
    fi
done

# ---- 4. PHP 配置检查 ----
echo ""
echo "--- [4] PHP 配置 ---"
UPLOAD_MAX=$(php -i 2>/dev/null | grep 'upload_max_filesize' | head -1 | awk '{print $NF}')
POST_MAX=$(php -i 2>/dev/null | grep 'post_max_size' | head -1 | awk '{print $NF}')
MEMORY_LIMIT=$(php -i 2>/dev/null | grep 'memory_limit' | head -1 | awk '{print $NF}')
MAX_EXECUTION=$(php -i 2>/dev/null | grep 'max_execution_time' | head -1 | awk '{print $NF}')

log_info "upload_max_filesize = ${UPLOAD_MAX:-未知}"
log_info "post_max_size       = ${POST_MAX:-未知}"
log_info "memory_limit        = ${MEMORY_LIMIT:-未知}"
log_info "max_execution_time  = ${MAX_EXECUTION:-未知}s"

if [[ "$UPLOAD_MAX" =~ ^[0-9]+M$ ]] && [ "${UPLOAD_MAX%M}" -ge 10 ]; then
    log_pass "上传大小限制 >= 10M ($UPLOAD_MAX)"
else
    log_warn "上传大小限制偏小 ($UPLOAD_MAX)，建议 >= 10M"
fi

# ---- 5. PHP-FPM 检测 ----
echo ""
echo "--- [5] PHP-FPM 进程 ---"
if pgrep -x "php-fpm" >/dev/null || pgrep "php-fpm:" >/dev/null; then
    FPM_PID=$(pgrep -f "php-fpm: master" | head -1)
    log_pass "PHP-FPM 运行中 (PID: $FPM_PID)"
    
    # 检测监听方式
    if ss -ltn 2>/dev/null | grep -q ':9000'; then
        log_info "监听方式: TCP 127.0.0.1:9000"
    elif ls /tmp/php-cgi-*.sock 2>/dev/null; then
        log_info "监听方式: Unix Socket ($(ls /tmp/php-cgi-*.sock 2>/dev/null | head -1))"
    else
        log_warn "无法确定 PHP-FPM 监听方式"
    fi
else
    log_fail "PHP-FPM 未运行"
fi

# ---- 6. MySQL 连接测试 ----
echo ""
echo "--- [6] MySQL 连接 ---"
if php -m 2>/dev/null | grep -q "pdo_mysql"; then
    php -r '
        try {
            $host = getenv("MYSQL_HOST") ?: "localhost";
            $port = getenv("MYSQL_PORT") ?: "3306";
            $user = getenv("MYSQL_USER") ?: "fubao";
            $pass = getenv("MYSQL_PASSWORD") ?: "";
            $db   = getenv("MYSQL_DATABASE") ?: "fubao";
            
            $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass);
            $version = $pdo->query("SELECT VERSION()")->fetchColumn();
            echo "\033[0;32m✅ MySQL 连接成功: $version\033[0m\n";
            
            // 检查 utf8mb4 支持
            $charset = $pdo->query("SHOW VARIABLES LIKE \'character_set_server\'")->fetch(PDO::FETCH_ASSOC);
            if ($charset && strpos($charset["Value"], "utf8mb4") !== false) {
                echo "\033[0;32m✅ 字符集: utf8mb4 ✓\033[0m\n";
            } else {
                echo "\033[0;33m⚠️  字符集: " . ($charset["Value"] ?? "未知") . " (建议 utf8mb4)\033[0m\n";
            }
        } catch (PDOException $e) {
            echo "\033[0;31m❌ MySQL 连接失败: " . $e->getMessage() . "\033[0m\n";
        }
    ' 2>/dev/null
else
    log_fail "pdo_mysql 未安装，无法测试 MySQL 连接"
fi

# ---- 7. 目录权限 ----
echo ""
echo "--- [7] 目录权限 ---"
BASE_DIR="/www/wwwroot/116.204.135.69"
DIRS=(
    "$BASE_DIR/public/uploads/goods"
    "$BASE_DIR/public/uploads/content"
    "$BASE_DIR/public/uploads/news"
    "$BASE_DIR/public/uploads/baike"
    "$BASE_DIR/php/runtime/cache"
    "$BASE_DIR/php/runtime/log"
    "$BASE_DIR/php/public/uploads"
)

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        if [ -w "$dir" ]; then
            log_pass "可写: ${dir#$BASE_DIR/}"
        else
            log_fail "无写权限: ${dir#$BASE_DIR/} (chmod 755 $dir)"
        fi
    else
        log_warn "不存在: ${dir#$BASE_DIR/} (mkdir -p $dir)"
    fi
done

# ============================================================
# 汇总
echo ""
echo "=============================================="
echo -e "  结果: ${GREEN}$PASS_COUNT 通过${NC} | ${RED}$FAIL_COUNT 失败${NC} | ${YELLOW}$WARN_COUNT 警告${NC}"
echo "=============================================="

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo ""
    echo -e "${RED}存在失败项，请修复后重试。${NC}"
    echo -e "${YELLOW}如需自动安装，运行: bash $0 --install${NC}"
    exit 1
elif [ "$1" == "--install" ]; then
    echo ""
    log_info "--install 模式：以下为手动安装参考命令"
    echo ""
    echo "# ===== CentOS 7 安装 PHP 7.4 + 扩展 ====="
    echo "# 方式一：使用宝塔面板（推荐）"
    echo "  1. 访问 bt.cn 安装宝塔面板"
    echo "  2. 软件商店 → PHP 7.4 → 安装"
    echo "  3. 安装扩展: pdo_mysql, mbstring, openssl, curl, gd, fileinfo"
    echo ""
    echo "# 方式二：Remi 源手动安装"
    echo "  yum install -y epel-release"
    echo "  yum install -y https://rpms.remirepo.net/enterprise/remi-release-7.rpm"
    echo "  yum install -y yum-utils"
    echo "  yum-config-manager --enable remi-php74"
    echo "  yum install -y php php-fpm \\"
    echo "      php-pdo php-mysqlnd \\"
    echo "      php-mbstring php-openssl php-curl \\"
    echo "      php-gd php-opcache php-zip \\"
    echo "      php-bcmath php-xml php-json \\"
    echo "      php-fileinfo php-pecl-redis"
    echo ""
    echo "  systemctl enable php-fpm"
    echo "  systemctl start php-fpm"
    echo ""
    echo "# ===== PHP 配置优化 ====="
    echo "# 编辑 /etc/php.ini:"
    echo "  upload_max_filesize = 10M"
    echo "  post_max_size = 20M"
    echo "  memory_limit = 256M"
    echo "  max_execution_time = 120"
    echo "  date.timezone = Asia/Shanghai"
    echo ""
    echo "# 重启服务:"
    echo "  systemctl restart php-fpm"
    echo "  nginx -t && nginx -s reload"
else
    exit 0
fi
