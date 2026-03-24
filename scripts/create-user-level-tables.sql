-- 用户等级表
CREATE TABLE IF NOT EXISTS user_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL UNIQUE,
  min_points INTEGER NOT NULL DEFAULT 0,
  max_points INTEGER,
  discount DECIMAL(5,2) DEFAULT 100, -- 折扣比例，100为无折扣，95为95折
  icon VARCHAR(255),
  color VARCHAR(20),
  benefits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认等级数据
INSERT INTO user_levels (name, level, min_points, max_points, discount, color, benefits) VALUES
('善信初學', 1, 0, 99, 100, '#9CA3AF', ARRAY['基礎會員權益']),
('入門信士', 2, 100, 499, 99, '#60A5FA', ARRAY['基礎會員權益', '生日禮券']),
('虔誠信士', 3, 500, 1999, 98, '#34D399', ARRAY['基礎會員權益', '生日禮券', '專屬客服']),
('資深信士', 4, 2000, 4999, 97, '#F59E0B', ARRAY['基礎會員權益', '生日禮券', '專屬客服', '優先發貨']),
('大道高士', 5, 5000, 9999, 95, '#EC4899', ARRAY['基礎會員權益', '生日禮券', '專屬客服', '優先發貨', '專屬折扣']),
('護法尊者', 6, 10000, 29999, 93, '#8B5CF6', ARRAY['基礎會員權益', '生日禮券', '專屬客服', '優先發貨', '專屬折扣', '限量預購']),
('天師護法', 7, 30000, NULL, 90, '#EF4444', ARRAY['基礎會員權益', '生日禮券', '專屬客服', '優先發貨', '專屬折扣', '限量預購', 'VIP專屬活動'])
ON CONFLICT (level) DO NOTHING;

-- 用户积分记录表
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL, -- earn, spend, expire, admin
  source VARCHAR(50), -- order, login, share, register, admin
  source_id INTEGER,
  description VARCHAR(255),
  balance_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points(created_at DESC);

-- 在用户表中添加积分和等级字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- 创建积分触发器函数
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
BEGIN
  -- 根据累计积分计算等级
  SELECT level INTO new_level
  FROM user_levels
  WHERE min_points <= NEW.total_points
  AND (max_points IS NULL OR max_points >= NEW.total_points)
  ORDER BY level DESC
  LIMIT 1;

  IF new_level IS NOT NULL AND new_level != NEW.level THEN
    NEW.level := new_level;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_level ON users;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF total_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();
