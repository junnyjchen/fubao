-- 用户签到记录表
CREATE TABLE IF NOT EXISTS user_signins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  sign_date DATE NOT NULL,
  continuous_days INTEGER DEFAULT 1,
  points_earned INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, sign_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_signins_user_id ON user_signins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signins_date ON user_signins(sign_date DESC);

-- 签到配置表
CREATE TABLE IF NOT EXISTS signin_config (
  id SERIAL PRIMARY KEY,
  day INTEGER NOT NULL UNIQUE, -- 连续签到天数
  points INTEGER NOT NULL DEFAULT 5, -- 奖励积分
  bonus_points INTEGER DEFAULT 0, -- 额外奖励
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认签到配置
INSERT INTO signin_config (day, points, bonus_points) VALUES
(1, 5, 0),
(2, 5, 0),
(3, 5, 0),
(4, 5, 0),
(5, 5, 0),
(6, 5, 0),
(7, 10, 20) -- 连续7天额外奖励20积分
ON CONFLICT (day) DO NOTHING;
