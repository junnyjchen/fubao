<?php
/**
 * 日志辅助类
 */

namespace app\common;

class Logger
{
    const DEBUG = 'DEBUG';
    const INFO = 'INFO';
    const NOTICE = 'NOTICE';
    const WARNING = 'WARNING';
    const ERROR = 'ERROR';
    const CRITICAL = 'CRITICAL';
    const ALERT = 'ALERT';
    const EMERGENCY = 'EMERGENCY';

    private $logPath;
    private $logFile;
    private $maxFiles = 30;
    private $maxFileSize = 10 * 1024 * 1024; // 10MB

    /**
     * 构造函数
     */
    public function __construct($logPath = null, $logFile = 'app.log')
    {
        $this->logPath = $logPath ?? dirname(__DIR__) . '/../../storage/logs';
        $this->logFile = $logFile;
        $this->ensureDirectory();
    }

    /**
     * 确保日志目录存在
     */
    private function ensureDirectory()
    {
        if (!is_dir($this->logPath)) {
            mkdir($this->logPath, 0755, true);
        }
    }

    /**
     * 写入日志
     */
    public function log($level, $message, $context = [])
    {
        $this->ensureDirectory();
        
        // 检查文件大小
        $this->rotateIfNeeded();
        
        $logFile = $this->logPath . '/' . $this->logFile;
        $timestamp = date('Y-m-d H:i:s');
        $ip = $this->getClientIp();
        $userId = $this->getUserId();
        
        $contextStr = empty($context) ? '' : ' ' . json_encode($context, JSON_UNESCAPED_UNICODE);
        
        $logLine = sprintf(
            "[%s] %s | %s | %s | %s%s\n",
            $timestamp,
            str_pad($level, 9),
            $ip,
            $userId,
            $message,
            $contextStr
        );
        
        file_put_contents($logFile, $logLine, FILE_APPEND);
        
        return $this;
    }

    /**
     * 调试日志
     */
    public function debug($message, $context = [])
    {
        return $this->log(self::DEBUG, $message, $context);
    }

    /**
     * 信息日志
     */
    public function info($message, $context = [])
    {
        return $this->log(self::INFO, $message, $context);
    }

    /**
     * 通知日志
     */
    public function notice($message, $context = [])
    {
        return $this->log(self::NOTICE, $message, $context);
    }

    /**
     * 警告日志
     */
    public function warning($message, $context = [])
    {
        return $this->log(self::WARNING, $message, $context);
    }

    /**
     * 错误日志
     */
    public function error($message, $context = [])
    {
        return $this->log(self::ERROR, $message, $context);
    }

    /**
     * 严重错误日志
     */
    public function critical($message, $context = [])
    {
        return $this->log(self::CRITICAL, $message, $context);
    }

    /**
     * 警报日志
     */
    public function alert($message, $context = [])
    {
        return $this->log(self::ALERT, $message, $context);
    }

    /**
     * 紧急日志
     */
    public function emergency($message, $context = [])
    {
        return $this->log(self::EMERGENCY, $message, $context);
    }

    /**
     * 记录异常
     */
    public function exception($exception, $context = [])
    {
        $message = sprintf(
            '%s in %s on line %d',
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine()
        );
        
        $context['trace'] = $exception->getTraceAsString();
        
        return $this->error($message, $context);
    }

    /**
     * 请求日志
     */
    public function request($message = 'Request')
    {
        $context = [
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
            'uri' => $_SERVER['REQUEST_URI'] ?? '/',
            'ip' => $this->getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'referer' => $_SERVER['HTTP_REFERER'] ?? '',
        ];
        
        return $this->info($message, $context);
    }

    /**
     * SQL日志
     */
    public function sql($sql, $bindings = [], $time = null)
    {
        $context = [
            'bindings' => $bindings,
            'time' => $time,
        ];
        
        return $this->debug('SQL: ' . $this->formatSql($sql), $context);
    }

    /**
     * API日志
     */
    public function api($action, $params = [], $response = null, $duration = null)
    {
        $context = [
            'params' => $params,
            'response' => $response,
            'duration' => $duration,
            'ip' => $this->getClientIp(),
        ];
        
        return $this->info("API: $action", $context);
    }

    /**
     * 获取客户端IP
     */
    private function getClientIp()
    {
        $ip = '';
        
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            $ip = $_SERVER['HTTP_X_REAL_IP'];
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        return trim($ip) ?: 'UNKNOWN';
    }

    /**
     * 获取用户ID
     */
    private function getUserId()
    {
        // 从 JWT token 或 session 获取用户ID
        $userId = $_SERVER['HTTP_X_USER_ID'] ?? 
                  $_SESSION['user_id'] ?? 
                  'GUEST';
        
        return is_numeric($userId) ? (string)$userId : $userId;
    }

    /**
     * 格式化SQL
     */
    private function formatSql($sql)
    {
        $sql = preg_replace('/\s+/', ' ', $sql);
        return trim($sql);
    }

    /**
     * 检查是否需要切割日志
     */
    private function rotateIfNeeded()
    {
        $logFile = $this->logPath . '/' . $this->logFile;
        
        if (!file_exists($logFile)) {
            return;
        }
        
        if (filesize($logFile) < $this->maxFileSize) {
            return;
        }
        
        $this->rotate();
    }

    /**
     * 切割日志
     */
    private function rotate()
    {
        $logFile = $this->logPath . '/' . $this->logFile;
        $timestamp = date('Y-m-d-His');
        $rotatedFile = $this->logPath . '/' . $timestamp . '-' . $this->logFile;
        
        rename($logFile, $rotatedFile);
        
        // 清理旧日志
        $this->cleanOldLogs();
    }

    /**
     * 清理旧日志
     */
    private function cleanOldLogs()
    {
        $files = glob($this->logPath . '/*-' . $this->logFile);
        
        if (count($files) <= $this->maxFiles) {
            return;
        }
        
        // 按时间排序，删除最旧的
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        
        $filesToDelete = array_slice($files, $this->maxFiles);
        
        foreach ($filesToDelete as $file) {
            @unlink($file);
        }
    }

    /**
     * 读取日志
     */
    public function read($lines = 100)
    {
        $logFile = $this->logPath . '/' . $this->logFile;
        
        if (!file_exists($logFile)) {
            return [];
        }
        
        $content = file($logFile);
        $content = array_slice($content, -$lines);
        
        return array_map('trim', $content);
    }

    /**
     * 清空日志
     */
    public function clear()
    {
        $logFile = $this->logPath . '/' . $this->logFile;
        
        if (file_exists($logFile)) {
            file_put_contents($logFile, '');
        }
    }

    /**
     * 获取日志文件路径
     */
    public function getLogPath()
    {
        return $this->logPath . '/' . $this->logFile;
    }
}
