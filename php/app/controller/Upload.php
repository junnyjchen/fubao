<?php
/**
 * 文件上传控制器
 */

namespace app\controller;

use app\Controller;

class Upload extends Controller
{
    /**
     * 上传图片
     */
    public function image()
    {
        $userId = $this->verifyUser();
        
        // 检查是否有文件上传
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $this->error('請上傳檔案');
        }
        
        $file = $_FILES['file'];
        
        // 验证文件类型
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            $this->error('不支援的檔案格式');
        }
        
        // 验证文件大小 (5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            $this->error('檔案大小不能超過5MB');
        }
        
        // 生成文件名
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $ext;
        $dir = date('Ymd');
        $relativePath = '/uploads/' . $dir;
        $fullDir = dirname(__DIR__, 2) . '/public' . $relativePath;
        $fullPath = $fullDir . '/' . $filename;
        
        // 创建目录
        if (!is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }
        
        // 移动文件
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            $url = $relativePath . '/' . $filename;
            
            $this->json([
                'url' => $url,
                'filename' => $filename,
                'size' => $file['size'],
                'type' => $file['type'],
            ], '上傳成功');
        }
        
        $this->error('上傳失敗');
    }
    
    /**
     * 上传多张图片
     */
    public function images()
    {
        $userId = $this->verifyUser();
        
        if (!isset($_FILES['files']) || empty($_FILES['files']['name'])) {
            $this->error('請上傳檔案');
        }
        
        $files = $_FILES['files'];
        $uploaded = [];
        $errors = [];
        
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $dir = date('Ymd');
        $relativePath = '/uploads/' . $dir;
        $fullDir = dirname(__DIR__, 2) . '/public' . $relativePath;
        
        if (!is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }
        
        $count = count($files['name']);
        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                $errors[] = $files['name'][$i] . ': 上傳失敗';
                continue;
            }
            
            if (!in_array($files['type'][$i], $allowedTypes)) {
                $errors[] = $files['name'][$i] . ': 不支援的格式';
                continue;
            }
            
            if ($files['size'][$i] > 5 * 1024 * 1024) {
                $errors[] = $files['name'][$i] . ': 檔案過大';
                continue;
            }
            
            $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
            $filename = uniqid() . '.' . $ext;
            $fullPath = $fullDir . '/' . $filename;
            
            if (move_uploaded_file($files['tmp_name'][$i], $fullPath)) {
                $uploaded[] = [
                    'url' => $relativePath . '/' . $filename,
                    'filename' => $filename,
                    'size' => $files['size'][$i],
                ];
            } else {
                $errors[] = $files['name'][$i] . ': 移動檔案失敗';
            }
        }
        
        $this->json([
            'uploaded' => $uploaded,
            'errors' => $errors,
        ], '上傳完成');
    }
    
    /**
     * 上传商品图片（带压缩）
     */
    public function goodsImage()
    {
        $userId = $this->verifyUser();
        
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $this->error('請上傳檔案');
        }
        
        $file = $_FILES['file'];
        
        // 验证文件类型
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            $this->error('不支援的檔案格式');
        }
        
        // 验证文件大小 (10MB)
        if ($file['size'] > 10 * 1024 * 1024) {
            $this->error('檔案大小不能超過10MB');
        }
        
        // 生成文件名
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'goods_' . uniqid() . '.' . $ext;
        $dir = '/uploads/goods/' . date('Ymd');
        $fullDir = dirname(__DIR__, 2) . '/public' . $dir;
        $fullPath = $fullDir . '/' . $filename;
        
        // 创建目录
        if (!is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }
        
        // 移动文件
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            // 可选：生成缩略图
            // self::generateThumbnail($fullPath, $fullDir . '/thumb_' . $filename);
            
            $url = $dir . '/' . $filename;
            
            $this->json([
                'url' => $url,
                'filename' => $filename,
                'size' => $file['size'],
            ], '上傳成功');
        }
        
        $this->error('上傳失敗');
    }
    
    /**
     * 上传 Banner 图片
     */
    public function bannerImage()
    {
        $userId = $this->verifyAdmin();
        
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $this->error('請上傳檔案');
        }
        
        $file = $_FILES['file'];
        
        // 验证文件类型
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            $this->error('不支援的檔案格式');
        }
        
        // 验证文件大小 (5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            $this->error('檔案大小不能超過5MB');
        }
        
        // 生成文件名
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'banner_' . uniqid() . '.' . $ext;
        $dir = '/uploads/banners/' . date('Ymd');
        $fullDir = dirname(__DIR__, 2) . '/public' . $dir;
        $fullPath = $fullDir . '/' . $filename;
        
        // 创建目录
        if (!is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }
        
        // 移动文件
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            $url = $dir . '/' . $filename;
            
            $this->json([
                'url' => $url,
                'filename' => $filename,
            ], '上傳成功');
        }
        
        $this->error('上傳失敗');
    }
    
    /**
     * 删除文件
     */
    public function delete()
    {
        $userId = $this->verifyUser();
        
        $path = $this->post('path');
        
        if (!$path) {
            $this->error('請指定檔案路徑');
        }
        
        // 安全检查：只允许删除 uploads 目录下的文件
        if (strpos($path, '/uploads/') !== 0) {
            $this->error('不允許刪除該檔案');
        }
        
        $fullPath = dirname(__DIR__, 2) . '/public' . $path;
        
        if (file_exists($fullPath) && unlink($fullPath)) {
            $this->json([], '刪除成功');
        }
        
        $this->error('刪除失敗');
    }
}
