<?php
/**
 * 健康检查控制器
 */

namespace app\controller;

use app\Controller;

class Health extends Controller
{
    /**
     * 健康检查
     */
    public function index()
    {
        $status = [
            'status' => 'ok',
            'timestamp' => time(),
            'datetime' => date('Y-m-d H:i:s'),
            'service' => 'fubao-api',
            'version' => '1.0.0',
        ];
        
        // 检查数据库连接
        try {
            $this->db->query("SELECT 1");
            $status['database'] = 'connected';
        } catch (\Exception $e) {
            $status['database'] = 'error';
            $status['status'] = 'degraded';
        }
        
        $this->json($status);
    }
}
