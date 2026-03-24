-- 用户浏览历史表
CREATE TABLE IF NOT EXISTS browse_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  goods_id INTEGER NOT NULL,
  view_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  view_duration INTEGER DEFAULT 0, -- 浏览时长（秒）
  UNIQUE(user_id, goods_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_browse_history_user_id ON browse_history(user_id);
CREATE INDEX IF NOT EXISTS idx_browse_history_view_time ON browse_history(view_time DESC);

-- 更新时间触发器（每次查看更新时间）
CREATE OR REPLACE FUNCTION update_browse_history_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.view_time = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_browse_history_time ON browse_history;
CREATE TRIGGER trigger_update_browse_history_time
  BEFORE INSERT ON browse_history
  FOR EACH ROW
  EXECUTE FUNCTION update_browse_history_time();
