<?php
/**
 * 数据库连接类
 */

namespace think\db;

use PDO;
use PDOException;

class Connection
{
    private static $instance = null;
    private $pdo;
    private $config;
    
    /**
     * 获取单例
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 构造函数
     */
    private function __construct()
    {
        $this->config = include CONFIG_PATH . 'database.php';
        $this->connect();
    }
    
    /**
     * 连接数据库
     */
    private function connect()
    {
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $this->config['hostname'],
                $this->config['hostport'],
                $this->config['database'],
                $this->config['charset']
            );
            
            $this->pdo = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $this->config['params']
            );
        } catch (PDOException $e) {
            throw new \Exception('数据库连接失败: ' . $e->getMessage());
        }
    }
    
    /**
     * 执行查询
     */
    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new \Exception('SQL执行失败: ' . $e->getMessage());
        }
    }
    
    /**
     * 获取所有记录
     */
    public function select($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * 获取单条记录
     */
    public function find($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * 获取第一列的值
     */
    public function value($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        $result = $stmt->fetch(PDO::FETCH_NUM);
        return $result ? $result[0] : null;
    }
    
    /**
     * 插入数据
     */
    public function insert($table, $data)
    {
        $fields = array_keys($data);
        $values = array_values($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        $sql = sprintf(
            "INSERT INTO `%s` (`%s`) VALUES (%s)",
            $table,
            implode('`, `', $fields),
            implode(', ', $placeholders)
        );
        
        $this->query($sql, $values);
        return $this->pdo->lastInsertId();
    }
    
    /**
     * 更新数据
     */
    public function update($table, $data, $where, $whereParams = [])
    {
        $sets = [];
        $params = [];
        
        foreach ($data as $key => $value) {
            $sets[] = "`{$key}` = ?";
            $params[] = $value;
        }
        
        $sql = sprintf(
            "UPDATE `%s` SET %s WHERE %s",
            $table,
            implode(', ', $sets),
            $where
        );
        
        $params = array_merge($params, $whereParams);
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    /**
     * 删除数据
     */
    public function delete($table, $where, $params = [])
    {
        $sql = sprintf("DELETE FROM `%s` WHERE %s", $table, $where);
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    /**
     * 统计数量
     */
    public function count($table, $where = '1=1', $params = [])
    {
        $sql = sprintf("SELECT COUNT(*) FROM `%s` WHERE %s", $table, $where);
        return (int) $this->value($sql, $params);
    }
    
    /**
     * 开始事务
     */
    public function begin()
    {
        $this->pdo->beginTransaction();
    }
    
    /**
     * 提交事务
     */
    public function commit()
    {
        $this->pdo->commit();
    }
    
    /**
     * 回滚事务
     */
    public function rollback()
    {
        $this->pdo->rollBack();
    }
    
    /**
     * 防止克隆
     */
    private function __clone() {}
}
