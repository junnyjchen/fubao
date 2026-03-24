/**
 * @fileoverview 分销系统数据库表结构
 * @description 创建邀请关系、分销佣金、提现等表
 * @module scripts/create-distribution-tables
 * 
 * 在 Supabase SQL Editor 中执行此脚本创建表结构
 */

-- ============================================
-- 1. 分销配置表 (distribution_config)
-- ============================================
CREATE TABLE IF NOT EXISTS distribution_config (
  id BIGSERIAL PRIMARY KEY,
  level SMALLINT NOT NULL, -- 分销层级 1/2/3
  rate DECIMAL(5,2) NOT NULL, -- 佣金比例 %
  team_leader_rate DECIMAL(5,2) DEFAULT 0, -- 团队长额外比例
  min_withdraw_amount DECIMAL(10,2) DEFAULT 100, -- 最低提现金额
  withdraw_fee_rate DECIMAL(5,2) DEFAULT 0, -- 提现手续费比例
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化默认配置
INSERT INTO distribution_config (level, rate, team_leader_rate) VALUES
(1, 10.00, 2.00),  -- 一级分销：10%，团队长额外2%
(2, 5.00, 1.00),   -- 二级分销：5%，团队长额外1%
(3, 2.00, 0.50)    -- 三级分销：2%，团队长额外0.5%
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. 用户分销信息表 (user_distribution)
-- ============================================
CREATE TABLE IF NOT EXISTS user_distribution (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  invite_code VARCHAR(20) NOT NULL UNIQUE, -- 邀请码
  parent_id TEXT, -- 上级用户ID
  parent_level_2_id TEXT, -- 上上级用户ID
  parent_level_3_id TEXT, -- 上上上级用户ID
  is_team_leader BOOLEAN DEFAULT FALSE, -- 是否是团队长
  team_leader_id TEXT, -- 所属团队长ID
  total_commission DECIMAL(12,2) DEFAULT 0, -- 累计佣金
  available_commission DECIMAL(12,2) DEFAULT 0, -- 可用佣金
  frozen_commission DECIMAL(12,2) DEFAULT 0, -- 冻结佣金
  withdrawn_commission DECIMAL(12,2) DEFAULT 0, -- 已提现佣金
  team_count INTEGER DEFAULT 0, -- 团队人数
  direct_count INTEGER DEFAULT 0, -- 直推人数
  level_2_count INTEGER DEFAULT 0, -- 二级人数
  level_3_count INTEGER DEFAULT 0, -- 三级人数
  total_team_sales DECIMAL(12,2) DEFAULT 0, -- 团队总销售额
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. 分销佣金记录表 (distribution_commissions)
-- ============================================
CREATE TABLE IF NOT EXISTS distribution_commissions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 获得佣金的用户
  from_user_id TEXT NOT NULL, -- 贡献佣金的用户
  order_id BIGINT NOT NULL, -- 订单ID
  order_no VARCHAR(50) NOT NULL, -- 订单编号
  order_amount DECIMAL(12,2) NOT NULL, -- 订单金额
  commission_rate DECIMAL(5,2) NOT NULL, -- 佣金比例
  commission_amount DECIMAL(12,2) NOT NULL, -- 佣金金额
  level SMALLINT NOT NULL, -- 分销层级 1/2/3
  is_team_leader_bonus BOOLEAN DEFAULT FALSE, -- 是否团队长奖励
  status SMALLINT DEFAULT 0, -- 0: 待结算 1: 已结算 2: 已取消
  settled_at TIMESTAMPTZ, -- 结算时间
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. 提现记录表 (withdrawals)
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL, -- 提现金额
  fee DECIMAL(12,2) DEFAULT 0, -- 手续费
  actual_amount DECIMAL(12,2) NOT NULL, -- 实际到账
  bank_name VARCHAR(50), -- 银行名称
  bank_account VARCHAR(50), -- 银行账号
  account_name VARCHAR(50), -- 账户名
  status SMALLINT DEFAULT 0, -- 0: 待审核 1: 已通过 2: 已拒绝 3: 已打款
  reject_reason VARCHAR(200), -- 拒绝原因
  reviewed_at TIMESTAMPTZ, -- 审核时间
  reviewer_id TEXT, -- 审核人
  paid_at TIMESTAMPTZ, -- 打款时间
  transaction_no VARCHAR(100), -- 打款流水号
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. 团队表 (teams)
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  leader_id TEXT NOT NULL, -- 团队长用户ID
  name VARCHAR(100), -- 团队名称
  description TEXT, -- 团队描述
  member_count INTEGER DEFAULT 1, -- 成员数量
  total_sales DECIMAL(12,2) DEFAULT 0, -- 团队总销售额
  total_commission DECIMAL(12,2) DEFAULT 0, -- 团队总佣金
  status SMALLINT DEFAULT 1, -- 0: 禁用 1: 正常
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. 分享记录表 (share_records)
-- ============================================
CREATE TABLE IF NOT EXISTS share_records (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- 分享者用户ID
  share_type VARCHAR(20) NOT NULL, -- goods/invite/share
  target_id BIGINT, -- 商品ID或其他目标ID
  channel VARCHAR(20), -- wechat/weibo/qrcode/link
  invite_code VARCHAR(20), -- 使用的邀请码
  view_count INTEGER DEFAULT 0, -- 浏览次数
  click_count INTEGER DEFAULT 0, -- 点击次数
  order_count INTEGER DEFAULT 0, -- 成交订单数
  order_amount DECIMAL(12,2) DEFAULT 0, -- 成交金额
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 创建索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_distribution_user_id ON user_distribution(user_id);
CREATE INDEX IF NOT EXISTS idx_user_distribution_invite_code ON user_distribution(invite_code);
CREATE INDEX IF NOT EXISTS idx_user_distribution_parent_id ON user_distribution(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_distribution_team_leader_id ON user_distribution(team_leader_id);

CREATE INDEX IF NOT EXISTS idx_distribution_commissions_user_id ON distribution_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_commissions_from_user_id ON distribution_commissions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_commissions_order_id ON distribution_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_distribution_commissions_status ON distribution_commissions(status);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);

CREATE INDEX IF NOT EXISTS idx_share_records_user_id ON share_records(user_id);
CREATE INDEX IF NOT EXISTS idx_share_records_invite_code ON share_records(invite_code);

-- ============================================
-- 创建触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_distribution_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_distribution_updated_at ON user_distribution;
CREATE TRIGGER update_user_distribution_updated_at
  BEFORE UPDATE ON user_distribution
  FOR EACH ROW
  EXECUTE FUNCTION update_distribution_updated_at();

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_distribution_updated_at();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_distribution_updated_at();

-- ============================================
-- 创建函数：生成邀请码
-- ============================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR AS $$
DECLARE
  chars VARCHAR := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code VARCHAR := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 创建函数：注册时自动建立分销关系
-- ============================================
CREATE OR REPLACE FUNCTION setup_distribution_relation(
  new_user_id TEXT,
  invite_code_param VARCHAR
) RETURNS void AS $$
DECLARE
  inviter_record RECORD;
  parent_2_id TEXT;
  parent_3_id TEXT;
  team_leader TEXT;
BEGIN
  -- 查找邀请人
  SELECT * INTO inviter_record 
  FROM user_distribution 
  WHERE invite_code = invite_code_param;
  
  IF inviter_record IS NOT NULL THEN
    -- 设置上级关系
    parent_2_id := inviter_record.parent_id;
    parent_3_id := inviter_record.parent_level_2_id;
    team_leader := COALESCE(inviter_record.team_leader_id, inviter_record.user_id);
    
    -- 创建新用户的分销信息
    INSERT INTO user_distribution (
      user_id, invite_code, parent_id, 
      parent_level_2_id, parent_level_3_id,
      team_leader_id
    ) VALUES (
      new_user_id, generate_invite_code(), inviter_record.user_id,
      parent_2_id, parent_3_id, team_leader
    );
    
    -- 更新邀请人的直推人数
    UPDATE user_distribution 
    SET direct_count = direct_count + 1,
        team_count = team_count + 1
    WHERE user_id = inviter_record.user_id;
    
    -- 更新上上级的二级人数
    IF parent_2_id IS NOT NULL THEN
      UPDATE user_distribution 
      SET level_2_count = level_2_count + 1,
          team_count = team_count + 1
      WHERE user_id = parent_2_id;
    END IF;
    
    -- 更新上上上级的三级人数
    IF parent_3_id IS NOT NULL THEN
      UPDATE user_distribution 
      SET level_3_count = level_3_count + 1,
          team_count = team_count + 1
      WHERE user_id = parent_3_id;
    END IF;
    
    -- 更新团队长的团队人数
    IF team_leader IS NOT NULL THEN
      UPDATE user_distribution 
      SET team_count = team_count + 1
      WHERE user_id = team_leader AND is_team_leader = TRUE;
    END IF;
  ELSE
    -- 没有邀请码，创建独立的分销信息
    INSERT INTO user_distribution (user_id, invite_code)
    VALUES (new_user_id, generate_invite_code());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 创建函数：计算订单佣金
-- ============================================
CREATE OR REPLACE FUNCTION calculate_order_commission(
  order_id_param BIGINT,
  order_no_param VARCHAR,
  buyer_id TEXT,
  order_amount_param DECIMAL
) RETURNS void AS $$
DECLARE
  buyer_dist RECORD;
  config_record RECORD;
  commission_amt DECIMAL;
BEGIN
  -- 获取买家的分销信息
  SELECT * INTO buyer_dist FROM user_distribution WHERE user_id = buyer_id;
  
  IF buyer_dist IS NULL OR buyer_dist.parent_id IS NULL THEN
    RETURN; -- 没有上级，不计算佣金
  END IF;
  
  -- 一级分销佣金
  SELECT * INTO config_record FROM distribution_config WHERE level = 1;
  IF config_record IS NOT NULL AND buyer_dist.parent_id IS NOT NULL THEN
    commission_amt := order_amount_param * config_record.rate / 100;
    
    INSERT INTO distribution_commissions (
      user_id, from_user_id, order_id, order_no,
      order_amount, commission_rate, commission_amount, level
    ) VALUES (
      buyer_dist.parent_id, buyer_id, order_id_param, order_no_param,
      order_amount_param, config_record.rate, commission_amt, 1
    );
    
    -- 团队长奖励
    IF buyer_dist.team_leader_id IS NOT NULL 
       AND buyer_dist.team_leader_id != buyer_dist.parent_id THEN
      INSERT INTO distribution_commissions (
        user_id, from_user_id, order_id, order_no,
        order_amount, commission_rate, commission_amount, level,
        is_team_leader_bonus
      ) VALUES (
        buyer_dist.team_leader_id, buyer_id, order_id_param, order_no_param,
        order_amount_param, config_record.team_leader_rate,
        order_amount_param * config_record.team_leader_rate / 100, 1, TRUE
      );
    END IF;
  END IF;
  
  -- 二级分销佣金
  SELECT * INTO config_record FROM distribution_config WHERE level = 2;
  IF config_record IS NOT NULL AND buyer_dist.parent_level_2_id IS NOT NULL THEN
    commission_amt := order_amount_param * config_record.rate / 100;
    
    INSERT INTO distribution_commissions (
      user_id, from_user_id, order_id, order_no,
      order_amount, commission_rate, commission_amount, level
    ) VALUES (
      buyer_dist.parent_level_2_id, buyer_id, order_id_param, order_no_param,
      order_amount_param, config_record.rate, commission_amt, 2
    );
  END IF;
  
  -- 三级分销佣金
  SELECT * INTO config_record FROM distribution_config WHERE level = 3;
  IF config_record IS NOT NULL AND buyer_dist.parent_level_3_id IS NOT NULL THEN
    commission_amt := order_amount_param * config_record.rate / 100;
    
    INSERT INTO distribution_commissions (
      user_id, from_user_id, order_id, order_no,
      order_amount, commission_rate, commission_amount, level
    ) VALUES (
      buyer_dist.parent_level_3_id, buyer_id, order_id_param, order_no_param,
      order_amount_param, config_record.rate, commission_amt, 3
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 添加注释
-- ============================================
COMMENT ON TABLE distribution_config IS '分销配置表';
COMMENT ON TABLE user_distribution IS '用户分销信息表';
COMMENT ON TABLE distribution_commissions IS '分销佣金记录表';
COMMENT ON TABLE withdrawals IS '提现记录表';
COMMENT ON TABLE teams IS '团队表';
COMMENT ON TABLE share_records IS '分享记录表';

COMMENT ON COLUMN user_distribution.invite_code IS '用户专属邀请码';
COMMENT ON COLUMN user_distribution.parent_id IS '直接上级用户ID';
COMMENT ON COLUMN user_distribution.is_team_leader IS '是否是团队长';
COMMENT ON COLUMN user_distribution.team_leader_id IS '所属团队长ID';

COMMENT ON COLUMN distribution_commissions.level IS '分销层级: 1-一级 2-二级 3-三级';
COMMENT ON COLUMN distribution_commissions.is_team_leader_bonus IS '是否为团队长奖励佣金';
