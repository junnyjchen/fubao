-- 消息通知系统数据表
-- 创建时间: 2026-03-24

-- 消息表
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
    type VARCHAR(30) NOT NULL COMMENT '消息类型：order-订单, coupon-优惠券, system-系统, distribution-分销',
    title VARCHAR(200) NOT NULL COMMENT '消息标题',
    content TEXT NOT NULL COMMENT '消息内容',
    link VARCHAR(500) COMMENT '跳转链接',
    image VARCHAR(500) COMMENT '消息图片',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    extra_data JSONB COMMENT '额外数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP COMMENT '阅读时间'
);

-- 系统公告表
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '公告标题',
    content TEXT NOT NULL COMMENT '公告内容',
    type VARCHAR(30) DEFAULT 'notice' COMMENT '公告类型：notice-通知, promotion-活动, update-更新',
    image VARCHAR(500) COMMENT '公告图片',
    start_time TIMESTAMP COMMENT '开始显示时间',
    end_time TIMESTAMP COMMENT '结束显示时间',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 公告阅读记录表
CREATE TABLE IF NOT EXISTS announcement_reads (
    id SERIAL PRIMARY KEY,
    announcement_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    UNIQUE(announcement_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_time ON announcements(start_time, end_time);

-- 插入示例数据
INSERT INTO notifications (user_id, type, title, content, link, is_read, created_at) VALUES
('user1', 'order', '訂單發貨通知', '您的訂單 #20260324001 已發貨，請注意查收', '/user/orders/1', false, '2026-03-24 10:00:00'),
('user1', 'coupon', '優惠券即將到期', '您的"新用戶專享券"將在7天後到期，快去使用吧！', '/user/coupons', false, '2026-03-23 15:00:00'),
('user1', 'system', '歡迎加入符寶網', '感謝您註冊符寶網，開啟您的玄門文化之旅！', null, true, '2026-03-20 09:00:00'),
('user1', 'distribution', '分銷佣金到賬', '您的好友完成購物，您獲得分銷佣金 HK$15.00', '/distribution/commissions', false, '2026-03-22 14:30:00');

INSERT INTO announcements (title, content, type, is_active, sort_order) VALUES
('符寶網正式上線', '歡迎來到符寶網，全球玄門文化科普交易平台。我們致力於為您提供優質的符籙、法器等產品，以及專業的玄門文化科普服務。', 'notice', true, 1),
('新用戶專享優惠', '新用戶註冊即可領取HK$50優惠券，滿HK$200可用。數量有限，先到先得！', 'promotion', true, 2);
