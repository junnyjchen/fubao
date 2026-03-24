/**
 * @fileoverview 晒图分享数据库表结构
 * @description 创建 shares, share_likes, share_comments 表
 * @module scripts/create-shares-tables
 * 
 * 在 Supabase SQL Editor 中执行此脚本创建表结构
 */

-- 晒图分享主表
CREATE TABLE IF NOT EXISTS shares (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goods_id BIGINT REFERENCES goods(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status SMALLINT DEFAULT 1, -- 0: deleted, 1: active, 2: hidden
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 点赞表
CREATE TABLE IF NOT EXISTS share_likes (
  id BIGSERIAL PRIMARY KEY,
  share_id BIGINT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(share_id, user_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS share_comments (
  id BIGSERIAL PRIMARY KEY,
  share_id BIGINT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status SMALLINT DEFAULT 1, -- 0: deleted, 1: active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_goods_id ON shares(goods_id);
CREATE INDEX IF NOT EXISTS idx_shares_status ON shares(status);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_share_likes_share_id ON share_likes(share_id);
CREATE INDEX IF NOT EXISTS idx_share_likes_user_id ON share_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_share_comments_share_id ON share_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_share_comments_user_id ON share_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_share_comments_created_at ON share_comments(created_at DESC);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 shares 表创建触发器
DROP TRIGGER IF EXISTS update_shares_updated_at ON shares;
CREATE TRIGGER update_shares_updated_at
  BEFORE UPDATE ON shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 share_comments 表创建触发器
DROP TRIGGER IF EXISTS update_share_comments_updated_at ON share_comments;
CREATE TRIGGER update_share_comments_updated_at
  BEFORE UPDATE ON share_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建递增/递减函数（用于点赞和评论计数）
CREATE OR REPLACE FUNCTION increment_likes(share_id_param BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE shares SET likes_count = likes_count + 1 WHERE id = share_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes(share_id_param BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE shares SET likes_count = GREATEST(0, likes_count - 1) WHERE id = share_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comments(share_id_param BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE shares SET comments_count = comments_count + 1 WHERE id = share_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_share_count(goods_id_param BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE goods SET share_count = COALESCE(share_count, 0) + 1 WHERE id = goods_id_param;
END;
$$ LANGUAGE plpgsql;

-- 添加注释
COMMENT ON TABLE shares IS '晒图分享表';
COMMENT ON TABLE share_likes IS '晒图点赞表';
COMMENT ON TABLE share_comments IS '晒图评论表';

COMMENT ON COLUMN shares.user_id IS '用户ID';
COMMENT ON COLUMN shares.goods_id IS '关联商品ID';
COMMENT ON COLUMN shares.order_id IS '关联订单ID';
COMMENT ON COLUMN shares.content IS '分享内容';
COMMENT ON COLUMN shares.images IS '图片URL数组';
COMMENT ON COLUMN shares.video_url IS '视频链接';
COMMENT ON COLUMN shares.likes_count IS '点赞数';
COMMENT ON COLUMN shares.comments_count IS '评论数';
COMMENT ON COLUMN shares.is_anonymous IS '是否匿名';
COMMENT ON COLUMN shares.status IS '状态: 0-已删除, 1-正常, 2-隐藏';

-- 如果 goods 表没有 share_count 字段，添加它
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goods' AND column_name = 'share_count'
  ) THEN
    ALTER TABLE goods ADD COLUMN share_count INTEGER DEFAULT 0;
  END IF;
END $$;
