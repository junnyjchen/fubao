<?php
/**
 * 管理员-数据库管理控制器
 */

namespace app\controller\admin;

use app\common\Response;

class Database
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
    }

    /**
     * 数据库状态
     * GET /api/admin/database
     */
    public function index()
    {
        $tables = $this->db->query("SHOW TABLES");
        $tableCount = count($tables);

        $status = [
            'engine' => 'MySQL',
            'connected' => true,
            'tables' => $tableCount,
            'table_list' => array_map(function ($t) {
                return array_values($t)[0];
            }, $tables),
        ];

        Response::success($status);
    }

    /**
     * 初始化数据库（建表+种子数据）
     * POST /api/admin/database/init
     */
    public function init()
    {
        $schemaFile = dirname(dirname(dirname(__DIR__))) . '/sql/schema.sql';
        $seedFile = dirname(dirname(dirname(__DIR__))) . '/sql/seed.sql';

        $results = [];

        if (file_exists($schemaFile)) {
            $schema = file_get_contents($schemaFile);
            $statements = array_filter(
                array_map('trim', explode(';', $schema)),
                function ($s) { return !empty($s) && !preg_match('/^--/', $s); }
            );

            foreach ($statements as $sql) {
                try {
                    $this->db->query($sql);
                } catch (\Exception $e) {
                    $results[] = 'Schema error: ' . $e->getMessage();
                }
            }
            $results[] = 'Schema executed';
        }

        if (file_exists($seedFile)) {
            $seed = file_get_contents($seedFile);
            $statements = array_filter(
                array_map('trim', explode(';', $seed)),
                function ($s) { return !empty($s) && !preg_match('/^--/', $s); }
            );

            foreach ($statements as $sql) {
                try {
                    $this->db->query($sql);
                } catch (\Exception $e) {
                    $results[] = 'Seed error: ' . $e->getMessage();
                }
            }
            $results[] = 'Seed data inserted';
        }

        Response::success($results, '数据库初始化完成');
    }

    /**
     * 测试连接
     * POST /api/admin/database/test
     */
    public function test()
    {
        try {
            $this->db->query("SELECT 1");
            Response::success(['connected' => true], 'MySQL连接正常');
        } catch (\Exception $e) {
            Response::error('连接失败: ' . $e->getMessage(), 500);
        }
    }
}
