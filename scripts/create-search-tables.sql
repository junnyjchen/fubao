-- 搜索关键词表
CREATE TABLE IF NOT EXISTS search_keywords (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL UNIQUE,
  count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_search_keywords_keyword ON search_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_search_keywords_count ON search_keywords(count DESC);

-- 创建增量计数函数
CREATE OR REPLACE FUNCTION increment_search_count(keyword_text TEXT)
RETURNS void AS $$
BEGIN
  UPDATE search_keywords
  SET count = count + 1,
      last_searched = CURRENT_TIMESTAMP
  WHERE LOWER(keyword) = LOWER(keyword_text);
END;
$$ LANGUAGE plpgsql;

-- 插入热门关键词示例数据
INSERT INTO search_keywords (keyword, count) VALUES
('太極符', 100),
('平安符', 95),
('招財符', 88),
('桃花符', 75),
('文昌符', 60),
('化煞符', 55),
('道家法器', 50),
('開光物品', 45)
ON CONFLICT (keyword) DO NOTHING;
