<?php
/**
 * 管理员-邮件服务控制器
 */

namespace app\controller\admin;

use app\common\Response;

class Email
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
    }

    /**
     * 获取邮件配置状态
     * GET /api/admin/email
     */
    public function index()
    {
        $config = $this->db->query(
            "SELECT `key`, `value` FROM settings WHERE `key` IN ('smtp_host','smtp_port','smtp_ssl','smtp_user','smtp_from_name','welcome_email_enabled')"
        );

        $result = [];
        foreach ($config as $row) {
            $result[$row['key']] = $row['value'];
        }

        // 隐藏密码
        $result['smtp_configured'] = !empty($result['smtp_host']) && !empty($result['smtp_user']);
        unset($result['smtp_user']); // 不暴露用户名

        Response::success($result);
    }

    /**
     * 测试SMTP连接
     * POST /api/admin/email { action: 'test' }
     */
    public function testConnection()
    {
        $settings = $this->db->query(
            "SELECT `key`, `value` FROM settings WHERE `key` LIKE 'smtp_%'"
        );

        $config = [];
        foreach ($settings as $row) {
            $config[$row['key']] = $row['value'];
        }

        if (empty($config['smtp_host']) || empty($config['smtp_user'])) {
            Response::error('SMTP未配置', 400);
        }

        try {
            $transport = new \PHPMailer\PHPMailer\SMTP();
            $connected = $transport->connect($config['smtp_host'], intval($config['smtp_port'] ?? 465), 10);
            if ($connected) {
                $transport->quit();
                $transport->close();
                Response::success(null, 'SMTP连接成功');
            } else {
                Response::error('SMTP连接失败', 500);
            }
        } catch (\Exception $e) {
            Response::error('连接失败: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 发送测试邮件
     * POST /api/admin/email { action: 'send', to: 'xxx@xxx.com' }
     */
    public function sendTest()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['to'])) {
            Response::error('请输入收件邮箱', 400);
        }

        // 使用PHPMailer发送
        $settings = $this->db->query(
            "SELECT `key`, `value` FROM settings WHERE `key` LIKE 'smtp_%'"
        );

        $config = [];
        foreach ($settings as $row) {
            $config[$row['key']] = $row['value'];
        }

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $config['smtp_host'] ?? 'smtp.qq.com';
            $mail->Port = intval($config['smtp_port'] ?? 465);
            $mail->SMTPSecure = ($config['smtp_ssl'] ?? 'true') === 'true' ? 'ssl' : 'tls';
            $mail->SMTPAuth = true;
            $mail->Username = $config['smtp_user'] ?? '';
            $mail->Password = $config['smtp_password'] ?? '';
            $mail->setFrom($config['smtp_user'], $config['smtp_from_name'] ?? '符寶網');
            $mail->addAddress($data['to']);
            $mail->Subject = '符寶網 - 邮件测试';
            $mail->Body = '这是一封测试邮件，如果您收到此邮件，说明邮件服务配置正常。';
            $mail->send();

            Response::success(null, '测试邮件发送成功');
        } catch (\Exception $e) {
            Response::error('发送失败: ' . $e->getMessage(), 500);
        }
    }
}
