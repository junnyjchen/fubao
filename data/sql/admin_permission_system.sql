-- =====================================================
-- 符寶網 - 管理员权限系统数据表
-- =====================================================

-- 1. 管理员角色表
CREATE TABLE IF NOT EXISTS admin_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
    description TEXT COMMENT '角色描述',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统角色（系统角色不可删除）',
    permissions JSONB DEFAULT '[]'::jsonb COMMENT '权限列表',
    status BOOLEAN DEFAULT TRUE COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    name VARCHAR(50) COMMENT '姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(500) COMMENT '头像',
    role_id INTEGER REFERENCES admin_roles(id) COMMENT '角色ID',
    status BOOLEAN DEFAULT TRUE COMMENT '状态',
    last_login_at TIMESTAMP COMMENT '最后登录时间',
    last_login_ip VARCHAR(50) COMMENT '最后登录IP',
    login_count INTEGER DEFAULT 0 COMMENT '登录次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    action VARCHAR(100) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '操作对象类型',
    target_id INTEGER COMMENT '操作对象ID',
    detail JSONB COMMENT '操作详情',
    ip VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '浏览器信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 权限表（代码式权限定义）
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '权限名称',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码',
    group_name VARCHAR(50) COMMENT '权限分组',
    description TEXT COMMENT '权限描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 预设权限
-- =====================================================
INSERT INTO permissions (name, code, group_name, description) VALUES
-- 系统管理
('系统设置', 'system.settings', 'system', '管理系统设置'),
('角色管理', 'system.roles', 'system', '管理角色'),
('管理员管理', 'system.admins', 'system', '管理管理员账户'),

-- 内容管理
('内容管理', 'content.view', 'content', '查看内容'),
('新闻管理', 'content.news', 'content', '管理新闻'),
('百科管理', 'content.wiki', 'content', '管理百科'),
('视频管理', 'content.video', 'content', '管理视频'),

-- 商品管理
('商品管理', 'goods.view', 'goods', '查看商品'),
('商品编辑', 'goods.edit', 'goods', '编辑商品'),
('商品上下架', 'goods.status', 'goods', '商品上下架'),
('商品删除', 'goods.delete', 'goods', '删除商品'),

-- 商户管理
('商户管理', 'merchant.view', 'merchant', '查看商户'),
('商户审核', 'merchant.audit', 'merchant', '审核商户'),
('商户编辑', 'merchant.edit', 'merchant', '编辑商户'),

-- 订单管理
('订单管理', 'order.view', 'order', '查看订单'),
('订单处理', 'order.process', 'order', '处理订单'),
('退款管理', 'order.refund', 'order', '处理退款'),

-- 用户管理
('用户管理', 'user.view', 'user', '查看用户'),
('用户编辑', 'user.edit', 'user', '编辑用户'),

-- 运营管理
('Banner管理', 'operation.banner', 'operation', '管理Banner'),
('页面装修', 'operation.page', 'operation', '页面装修'),
('活动管理', 'operation.activity', 'operation', '活动管理'),
('优惠券管理', 'operation.coupon', 'operation', '优惠券管理'),

-- 数据统计
('数据统计', 'data.stats', 'data', '查看统计数据'),
('数据导出', 'data.export', 'data', '导出数据')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 预设角色
-- =====================================================
INSERT INTO admin_roles (name, code, description, is_system, permissions) VALUES
('超级管理员', 'super_admin', '拥有所有权限', TRUE, 
 '["system.settings", "system.roles", "system.admins", "content.view", "content.news", "content.wiki", "content.video", "goods.view", "goods.edit", "goods.status", "goods.delete", "merchant.view", "merchant.audit", "merchant.edit", "order.view", "order.process", "order.refund", "user.view", "user.edit", "operation.banner", "operation.page", "operation.activity", "operation.coupon", "data.stats", "data.export"]'),
 
('运营主管', 'operation_manager', '负责日常运营管理', FALSE,
 '["content.view", "content.news", "content.wiki", "content.video", "goods.view", "goods.edit", "goods.status", "order.view", "order.process", "operation.banner", "operation.page", "operation.activity", "operation.coupon", "data.stats"]'),
 
('内容编辑', 'content_editor', '负责内容编辑发布', FALSE,
 '["content.view", "content.news", "content.wiki", "content.video", "operation.banner", "data.stats"]'),
 
('客服', 'customer_service', '负责客服和订单处理', FALSE,
 '["order.view", "order.process", "order.refund", "user.view", "data.stats"]'),
 
('商户', 'merchant', '商户自有管理', FALSE,
 '["goods.view", "goods.edit", "goods.status", "order.view", "order.process", "data.stats"]')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 创建默认管理员账户（密码：admin123）
-- 密码使用 bcrypt 加密
-- =====================================================
INSERT INTO admins (username, password, name, email, role_id) 
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye0Yp6tGQBQZ3b8J8j5Z8Z8Z8Z8Z8Z8Z8', '系统管理员', 'admin@fubao.ltd', id
FROM admin_roles WHERE code = 'super_admin'
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role_id);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_time ON admin_logs(created_at);
