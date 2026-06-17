#!/usr/bin/env php
<?php
/**
 * 符寶網 - PHP 环境检测脚本
 * 
 * 用法: php php/check-env.php
 * 检测服务器 PHP 版本和扩展是否满足项目要求
 */

echo "========================================\n";
echo "  符寶網 PHP 环境检测\n";
echo "========================================\n\n";

$errors = 0;
$warnings = 0;

// ==================== PHP 版本检测 ====================
echo "[1] PHP 版本检测\n";
$currentVersion = PHP_VERSION;
$requiredVersion = '8.0.0';
$recommendedVersion = '8.1.0';

echo "    当前版本: PHP {$currentVersion}\n";
echo "    最低要求: PHP {$requiredVersion}\n";
echo "    推荐版本: PHP {$requiredVersion}+\n";

if (version_compare($currentVersion, $requiredVersion, '>=')) {
    echo "    ✅ PHP 版本满足要求\n";
} else {
    echo "    ❌ PHP 版本过低，需要 {$requiredVersion}+\n";
    $errors++;
}
echo "\n";

// ==================== 必需扩展检测 ====================
echo "[2] 必需扩展检测\n";

$requiredExtensions = [
    'pdo'        => 'PDO (数据库抽象层)',
    'pdo_mysql'  => 'PDO MySQL (MySQL 驱动)',
    'json'       => 'JSON (数据序列化)',
    'mbstring'   => 'Mbstring (多字节字符串/中文处理)',
    'openssl'    => 'OpenSSL (JWT签名/HTTPS/cURL SSL)',
    'curl'       => 'cURL (外部API调用/OAuth/短信)',
    'hash'       => 'Hash (JWT HMAC-SHA256 签名)',
    'session'    => 'Session (会话管理)',
    'fileinfo'   => 'Fileinfo (文件类型检测/上传验证)',
];

foreach ($requiredExtensions as $ext => $desc) {
    if (extension_loaded($ext)) {
        echo "    ✅ {$desc} ({$ext})\n";
    } else {
        echo "    ❌ {$desc} ({$ext}) - 未安装\n";
        $errors++;
    }
}
echo "\n";

// ==================== 推荐扩展检测 ====================
echo "[3] 推荐扩展检测\n";

$recommendedExtensions = [
    'gd'       => 'GD (图片处理/缩略图生成)',
    'redis'    => 'Redis (缓存加速，可选)',
    'opcache'  => 'OPcache (PHP 字节码缓存，性能优化)',
    'zip'      => 'Zip (打包导出)',
    'bcmath'   => 'BCMath (高精度数学运算)',
    'xml'      => 'XML (XML解析)',
    'simplexml'=> 'SimpleXML (简单XML处理)',
];

foreach ($recommendedExtensions as $ext => $desc) {
    if (extension_loaded($ext)) {
        echo "    ✅ {$desc} ({$ext})\n";
    } else {
        echo "    ⚠️  {$desc} ({$ext}) - 未安装（推荐但非必需）\n";
        $warnings++;
    }
}
echo "\n";

// ==================== PHP 配置检测 ====================
echo "[4] PHP 配置检测\n";

$configs = [
    'upload_max_filesize'    => ['推荐值' => '10M', '说明' => '上传文件大小限制'],
    'post_max_size'          => ['推荐值' => '20M', '说明' => 'POST 数据大小限制'],
    'max_execution_time'     => ['推荐值' => '60',  '说明' => '脚本最大执行时间(秒)'],
    'memory_limit'           => ['推荐值' => '256M','说明' => 'PHP 内存限制'],
    'max_file_uploads'       => ['推荐值' => '20',  '说明' => '最大同时上传文件数'],
    'allow_url_fopen'        => ['推荐值' => 'On',  '说明' => '允许远程文件读取'],
    'display_errors'         => ['推荐值' => 'Off', '说明' => '生产环境关闭错误显示'],
];

foreach ($configs as $key => $info) {
    $current = ini_get($key);
    $current = $current ?: '(未设置)';
    echo "    {$info['说明']} ({$key})\n";
    echo "      当前: {$current}  |  推荐: {$info['推荐值']}\n";
}
echo "\n";

// ==================== 数据库连接检测 ====================
echo "[5] 数据库连接检测\n";

$dbHost = getenv('DB_HOST') ?: getenv('MYSQL_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: getenv('MYSQL_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: getenv('MYSQL_DATABASE') ?: 'fubao';
$dbUser = getenv('DB_USER') ?: getenv('MYSQL_USER') ?: 'root';
$dbPass = getenv('DB_PASSWORD') ?: getenv('MYSQL_PASSWORD') ?: '';

echo "    主机: {$dbHost}:{$dbPort}\n";
echo "    数据库: {$dbName}\n";

if (extension_loaded('pdo_mysql')) {
    try {
        $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        $version = $pdo->query('SELECT VERSION()')->fetchColumn();
        echo "    ✅ 数据库连接成功 (MySQL {$version})\n";
        
        // 检查 utf8mb4 支持
        $charset = $pdo->query("SHOW VARIABLES LIKE 'character_set_server'")->fetchColumn(1);
        echo "    服务器字符集: {$charset}\n";
        if ($charset === 'utf8mb4') {
            echo "    ✅ 字符集正确 (utf8mb4)\n";
        } else {
            echo "    ⚠️  建议设置 character_set_server = utf8mb4\n";
            $warnings++;
        }
    } catch (PDOException $e) {
        echo "    ❌ 数据库连接失败: " . $e->getMessage() . "\n";
        $errors++;
    }
} else {
    echo "    ⏭️  跳过 (pdo_mysql 扩展未安装)\n";
}
echo "\n";

// ==================== 目录权限检测 ====================
echo "[6] 目录权限检测\n";

$dirs = [
    dirname(__DIR__) . '/public/uploads'   => '上传目录',
    dirname(__DIR__) . '/runtime'          => '运行时目录',
    dirname(__DIR__) . '/runtime/cache'    => '缓存目录',
    dirname(__DIR__) . '/runtime/log'      => '日志目录',
];

foreach ($dirs as $dir => $desc) {
    if (is_dir($dir)) {
        if (is_writable($dir)) {
            echo "    ✅ {$desc} ({$dir}) - 可写\n";
        } else {
            echo "    ❌ {$desc} ({$dir}) - 不可写\n";
            $errors++;
        }
    } else {
        // 尝试创建
        if (@mkdir($dir, 0755, true)) {
            echo "    ✅ {$desc} ({$dir}) - 已自动创建\n";
        } else {
            echo "    ❌ {$desc} ({$dir}) - 不存在且无法创建\n";
            $errors++;
        }
    }
}
echo "\n";

// ==================== Nginx/PHP-FPM 检测 ====================
echo "[7] 服务进程检测\n";

// 检测 PHP-FPM
$fpmCheck = false;
if (file_exists('/var/run/php/php-fpm.sock')) {
    echo "    ✅ PHP-FPM socket 存在\n";
    $fpmCheck = true;
} elseif (file_exists('/var/run/php-fpm/php-fpm.sock')) {
    echo "    ✅ PHP-FPM socket 存在 (替代路径)\n";
    $fpmCheck = true;
} else {
    echo "    ⚠️  PHP-FPM socket 未找到 (可能使用 TCP 或未启动)\n";
    $warnings++;
}

// 检测 Nginx
$nginxOutput = [];
exec('which nginx 2>/dev/null', $nginxOutput);
if (!empty($nginxOutput)) {
    echo "    ✅ Nginx 已安装\n";
} else {
    echo "    ⚠️  Nginx 未检测到 (可能使用其他反向代理)\n";
    $warnings++;
}

// 检测 Node.js (Next.js SSR)
$nodeOutput = [];
exec('node -v 2>/dev/null', $nodeOutput);
if (!empty($nodeOutput)) {
    echo "    ✅ Node.js {$nodeOutput[0]}\n";
} else {
    echo "    ❌ Node.js 未安装 (Next.js SSR 需要)\n";
    $errors++;
}
echo "\n";

// ==================== 总结 ====================
echo "========================================\n";
echo "  检测结果\n";
echo "========================================\n";

if ($errors === 0 && $warnings === 0) {
    echo "  🎉 全部通过！环境满足所有要求。\n";
} elseif ($errors === 0) {
    echo "  ⚠️  基本通过，有 {$warnings} 个警告建议处理。\n";
} else {
    echo "  ❌ 有 {$errors} 个错误需要修复，{$warnings} 个警告。\n";
}

echo "\n";

if ($errors > 0) {
    echo "常见修复命令 (CentOS/RHEL):\n";
    echo "  yum install epel-release\n";
    echo "  yum install php php-pdo php-mysqlnd php-json php-mbstring php-openssl php-curl php-gd php-opcache php-zip php-bcmath php-xml php-simplexml php-fileinfo\n";
    echo "  systemctl restart php-fpm\n";
    echo "\n";
    echo "常见修复命令 (Ubuntu/Debian):\n";
    echo "  apt install php php-mysql php-mbstring php-curl php-gd php-xml php-zip php-bcmath php-opcache php-fpm\n";
    echo "  systemctl restart php8.1-fpm\n";
}

exit($errors > 0 ? 1 : 0);
