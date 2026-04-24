<?php
/**
 * 缓存辅助类
 */

namespace app\common;

class Cache
{
    private $cachePath;
    private $defaultTTL = 3600; // 1小时

    /**
     * 构造函数
     */
    public function __construct($cachePath = null)
    {
        $this->cachePath = $cachePath ?? dirname(__DIR__) . '/../../storage/cache';
        
        if (!is_dir($this->cachePath)) {
            mkdir($this->cachePath, 0755, true);
        }
    }

    /**
     * 设置缓存
     */
    public function set($key, $value, $ttl = null)
    {
        $ttl = $ttl ?? $this->defaultTTL;
        $file = $this->getFilePath($key);
        
        $data = [
            'value' => $value,
            'expire' => time() + $ttl,
        ];
        
        return file_put_contents(
            $file, 
            serialize($data),
            LOCK_EX
        ) !== false;
    }

    /**
     * 获取缓存
     */
    public function get($key, $default = null)
    {
        $file = $this->getFilePath($key);
        
        if (!file_exists($file)) {
            return $default;
        }
        
        $content = file_get_contents($file);
        $data = @unserialize($content);
        
        if ($data === false) {
            return $default;
        }
        
        // 检查过期
        if (isset($data['expire']) && $data['expire'] < time()) {
            @unlink($file);
            return $default;
        }
        
        return $data['value'] ?? $default;
    }

    /**
     * 检查缓存是否存在
     */
    public function has($key)
    {
        $file = $this->getFilePath($key);
        
        if (!file_exists($file)) {
            return false;
        }
        
        $content = file_get_contents($file);
        $data = @unserialize($content);
        
        if ($data === false) {
            return false;
        }
        
        // 检查过期
        if (isset($data['expire']) && $data['expire'] < time()) {
            @unlink($file);
            return false;
        }
        
        return true;
    }

    /**
     * 删除缓存
     */
    public function delete($key)
    {
        $file = $this->getFilePath($key);
        
        if (file_exists($file)) {
            return @unlink($file);
        }
        
        return true;
    }

    /**
     * 清空所有缓存
     */
    public function flush()
    {
        $files = glob($this->cachePath . '/*.cache');
        $count = 0;
        
        foreach ($files as $file) {
            if (@unlink($file)) {
                $count++;
            }
        }
        
        return $count;
    }

    /**
     * 获取并删除
     */
    public function pull($key, $default = null)
    {
        $value = $this->get($key, $default);
        $this->delete($key);
        return $value;
    }

    /**
     * 缓存增加
     */
    public function increment($key, $value = 1)
    {
        $current = (int) $this->get($key, 0);
        $new = $current + $value;
        $this->set($key, $new);
        return $new;
    }

    /**
     * 缓存减少
     */
    public function decrement($key, $value = 1)
    {
        return $this->increment($key, -$value);
    }

    /**
     * 记住（如果不存在则执行回调）
     */
    public function remember($key, $ttl, $callback)
    {
        if ($this->has($key)) {
            return $this->get($key);
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        return $value;
    }

    /**
     * 永久缓存
     */
    public function forever($key, $value)
    {
        return $this->set($key, $value, 0);
    }

    /**
     * 获取缓存文件路径
     */
    private function getFilePath($key)
    {
        $key = $this->normalizeKey($key);
        return $this->cachePath . '/' . $key . '.cache';
    }

    /**
     * 规范化键名
     */
    private function normalizeKey($key)
    {
        // 替换特殊字符
        $key = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $key);
        
        // 限制长度
        if (strlen($key) > 64) {
            $key = md5($key);
        }
        
        return $key;
    }

    /**
     * 获取缓存统计
     */
    public function stats()
    {
        $files = glob($this->cachePath . '/*.cache');
        $totalSize = 0;
        $expired = 0;
        $valid = 0;
        
        foreach ($files as $file) {
            $totalSize += filesize($file);
            
            $content = file_get_contents($file);
            $data = @unserialize($content);
            
            if ($data === false) {
                $expired++;
            } elseif (isset($data['expire']) && $data['expire'] < time()) {
                $expired++;
            } else {
                $valid++;
            }
        }
        
        return [
            'total_files' => count($files),
            'valid_files' => $valid,
            'expired_files' => $expired,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatSize($totalSize),
        ];
    }

    /**
     * 格式化大小
     */
    private function formatSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * 清理过期缓存
     */
    public function cleanExpired()
    {
        $files = glob($this->cachePath . '/*.cache');
        $count = 0;
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = @unserialize($content);
            
            if ($data === false) {
                @unlink($file);
                $count++;
            } elseif (isset($data['expire']) && $data['expire'] < time()) {
                @unlink($file);
                $count++;
            }
        }
        
        return $count;
    }
}
