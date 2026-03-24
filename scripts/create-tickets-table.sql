-- 客服工单表
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ticket_no VARCHAR(32) NOT NULL UNIQUE, -- 工单号
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 订单问题/商品咨询/售后投诉/账户问题/其他
  priority VARCHAR(20) DEFAULT 'normal', -- low/normal/high/urgent
  status VARCHAR(20) DEFAULT 'pending', -- pending/processing/resolved/closed
  content TEXT NOT NULL,
  images TEXT[], -- 附件图片
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 工单回复表
CREATE TABLE IF NOT EXISTS ticket_replies (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER, -- 用户ID (null表示客服回复)
  is_staff BOOLEAN DEFAULT false, -- 是否客服回复
  content TEXT NOT NULL,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);

-- 工单号生成函数
CREATE OR REPLACE FUNCTION generate_ticket_no()
RETURNS VARCHAR AS $$
DECLARE
  ticket_no VARCHAR(32);
BEGIN
  ticket_no := 'TK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('ticket_no_seq')::TEXT, 6, '0');
  RETURN ticket_no;
END;
$$ LANGUAGE plpgsql;

-- 创建序列
CREATE SEQUENCE IF NOT EXISTS ticket_no_seq;

-- 触发器：自动生成工单号
CREATE OR REPLACE FUNCTION set_ticket_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_no := generate_ticket_no();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ticket_no ON tickets;
CREATE TRIGGER trigger_set_ticket_no
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_no();
