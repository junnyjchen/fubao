-- 优惠券系统数据表
-- 创建时间: 2026-03-24

-- 优惠券模板表
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    code VARCHAR(50) UNIQUE COMMENT '优惠券码（可为空，为空时需领取）',
    type VARCHAR(20) NOT NULL DEFAULT 'discount' COMMENT '类型：discount-折扣券, cash-现金券, shipping-免运费券',
    discount_type VARCHAR(20) NOT NULL DEFAULT 'fixed' COMMENT '折扣类型：fixed-固定金额, percent-百分比',
    discount_value DECIMAL(10,2) NOT NULL COMMENT '折扣值',
    min_amount DECIMAL(10,2) DEFAULT 0 COMMENT '最低消费金额',
    max_discount DECIMAL(10,2) COMMENT '最大折扣金额（百分比折扣时）',
    total_count INT DEFAULT -1 COMMENT '发放总量，-1表示无限制',
    used_count INT DEFAULT 0 COMMENT '已使用数量',
    per_user_limit INT DEFAULT 1 COMMENT '每人限领数量',
    received_count INT DEFAULT 0 COMMENT '已领取数量',
    start_time TIMESTAMP NOT NULL COMMENT '生效时间',
    end_time TIMESTAMP NOT NULL COMMENT '失效时间',
    scope VARCHAR(20) DEFAULT 'all' COMMENT '适用范围：all-全场, category-分类, goods-指定商品',
    scope_ids TEXT COMMENT '适用ID列表，JSON数组',
    merchant_id INT COMMENT '商户ID，为空表示平台券',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    description TEXT COMMENT '使用说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS user_coupons (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
    coupon_id INT NOT NULL COMMENT '优惠券ID',
    order_id INT COMMENT '使用的订单ID',
    status VARCHAR(20) DEFAULT 'unused' COMMENT '状态：unused-未使用, used-已使用, expired-已过期',
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    used_at TIMESTAMP COMMENT '使用时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    UNIQUE(user_id, coupon_id)
);

-- 优惠券使用记录表
CREATE TABLE IF NOT EXISTS coupon_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    coupon_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL COMMENT '折扣金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_merchant ON coupons(merchant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_status ON user_coupons(status);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon ON user_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_logs_user ON coupon_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_logs_order ON coupon_usage_logs(order_id);

-- 插入示例优惠券数据
INSERT INTO coupons (name, code, type, discount_type, discount_value, min_amount, total_count, per_user_limit, start_time, end_time, scope, is_active, description) VALUES
('新用戶專享券', 'NEWUSER50', 'cash', 'fixed', 50.00, 200.00, 1000, 1, '2024-01-01 00:00:00', '2026-12-31 23:59:59', 'all', TRUE, '新用戶首單立減HK$50，滿HK$200可用'),
('開年大促優惠券', 'SPRING2025', 'discount', 'percent', 15.00, 300.00, 500, 2, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 'all', TRUE, '全場滿HK$300享85折優惠'),
('免運費券', 'FREESHIP', 'shipping', 'fixed', 30.00, 100.00, 2000, 3, '2024-01-01 00:00:00', '2026-12-31 23:59:59', 'all', TRUE, '滿HK$100免運費'),
('符籙專屬優惠券', 'FULU20', 'cash', 'fixed', 20.00, 100.00, 500, 2, '2024-01-01 00:00:00', '2026-12-31 23:59:59', 'category', TRUE, '符籙類商品專享，滿HK$100減HK$20');

-- 更新描述为JSON格式的scope_ids
UPDATE coupons SET scope_ids = '[1]' WHERE code = 'FULU20';
