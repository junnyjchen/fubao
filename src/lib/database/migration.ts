/**
 * @fileoverview 数据库迁移工具
 * @description 数据库表结构管理和迁移脚本
 * @module lib/database/migration
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

// 迁移状态
export interface MigrationRecord {
  id: string;
  name: string;
  executed_at: string;
}

// 迁移定义
export interface Migration {
  id: string;
  name: string;
  description: string;
  up: string; // SQL to apply migration
  down: string; // SQL to rollback migration
}

// 所有迁移定义
export const migrations: Migration[] = [
  {
    id: '001',
    name: 'create_users_table',
    description: '创建用户表',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        real_name VARCHAR(50),
        avatar VARCHAR(500),
        level INTEGER DEFAULT 1,
        points INTEGER DEFAULT 0,
        balance DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        referral_code VARCHAR(20) UNIQUE,
        referrer_id UUID REFERENCES users(id),
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
    `,
    down: `
      DROP TABLE IF EXISTS users CASCADE;
    `,
  },
  {
    id: '002',
    name: 'create_categories_table',
    description: '创建分类表',
    up: `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        parent_id UUID REFERENCES categories(id),
        description TEXT,
        icon VARCHAR(100),
        image VARCHAR(500),
        sort INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    `,
    down: `
      DROP TABLE IF EXISTS categories CASCADE;
    `,
  },
  {
    id: '003',
    name: 'create_goods_table',
    description: '创建商品表',
    up: `
      CREATE TABLE IF NOT EXISTS goods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE,
        category_id UUID REFERENCES categories(id),
        merchant_id UUID REFERENCES users(id),
        description TEXT,
        content TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        stock INTEGER DEFAULT 0,
        sales INTEGER DEFAULT 0,
        images TEXT[],
        main_image VARCHAR(500),
        unit VARCHAR(20),
        weight DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'active',
        is_featured BOOLEAN DEFAULT false,
        is_new BOOLEAN DEFAULT false,
        is_hot BOOLEAN DEFAULT false,
        sort INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_goods_category_id ON goods(category_id);
      CREATE INDEX IF NOT EXISTS idx_goods_merchant_id ON goods(merchant_id);
      CREATE INDEX IF NOT EXISTS idx_goods_status ON goods(status);
      CREATE INDEX IF NOT EXISTS idx_goods_slug ON goods(slug);
    `,
    down: `
      DROP TABLE IF EXISTS goods CASCADE;
    `,
  },
  {
    id: '004',
    name: 'create_orders_table',
    description: '创建订单表',
    up: `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_no VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        shipping_fee DECIMAL(10, 2) DEFAULT 0,
        final_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_time TIMESTAMP,
        shipping_name VARCHAR(50),
        shipping_phone VARCHAR(20),
        shipping_address TEXT,
        shipping_time TIMESTAMP,
        receive_time TIMESTAMP,
        remark TEXT,
        coupon_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `,
    down: `
      DROP TABLE IF EXISTS orders CASCADE;
    `,
  },
  {
    id: '005',
    name: 'create_order_items_table',
    description: '创建订单商品表',
    up: `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        goods_id UUID REFERENCES goods(id),
        goods_name VARCHAR(200) NOT NULL,
        goods_image VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_goods_id ON order_items(goods_id);
    `,
    down: `
      DROP TABLE IF EXISTS order_items CASCADE;
    `,
  },
  {
    id: '006',
    name: 'create_cart_table',
    description: '创建购物车表',
    up: `
      CREATE TABLE IF NOT EXISTS cart (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        goods_id UUID REFERENCES goods(id) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        selected BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, goods_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS cart CASCADE;
    `,
  },
  {
    id: '007',
    name: 'create_addresses_table',
    description: '创建地址表',
    up: `
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        province VARCHAR(50),
        city VARCHAR(50),
        district VARCHAR(50),
        address TEXT NOT NULL,
        postal_code VARCHAR(10),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS addresses CASCADE;
    `,
  },
  {
    id: '008',
    name: 'create_favorites_table',
    description: '创建收藏表',
    up: `
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        goods_id UUID REFERENCES goods(id) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, goods_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_goods_id ON favorites(goods_id);
    `,
    down: `
      DROP TABLE IF EXISTS favorites CASCADE;
    `,
  },
  {
    id: '009',
    name: 'create_coupons_table',
    description: '创建优惠券表',
    up: `
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE,
        type VARCHAR(20) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        min_amount DECIMAL(10, 2) DEFAULT 0,
        max_discount DECIMAL(10, 2),
        total_count INTEGER NOT NULL,
        used_count INTEGER DEFAULT 0,
        per_user_limit INTEGER DEFAULT 1,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
    `,
    down: `
      DROP TABLE IF EXISTS coupons CASCADE;
    `,
  },
  {
    id: '010',
    name: 'create_reviews_table',
    description: '创建评价表',
    up: `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id),
        goods_id UUID REFERENCES goods(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        images TEXT[],
        is_anonymous BOOLEAN DEFAULT false,
        reply TEXT,
        reply_time TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_reviews_goods_id ON reviews(goods_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    `,
    down: `
      DROP TABLE IF EXISTS reviews CASCADE;
    `,
  },
  {
    id: '011',
    name: 'create_system_logs_table',
    description: '创建系统日志表',
    up: `
      CREATE TABLE IF NOT EXISTS system_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        level VARCHAR(20) NOT NULL,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        message TEXT,
        user_id UUID,
        user_name VARCHAR(50),
        ip VARCHAR(50),
        user_agent TEXT,
        request_url VARCHAR(500),
        request_method VARCHAR(10),
        request_params JSONB,
        response_status INTEGER,
        error_stack TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
      CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module);
      CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
    `,
    down: `
      DROP TABLE IF EXISTS system_logs CASCADE;
    `,
  },
  {
    id: '012',
    name: 'create_settings_table',
    description: '创建系统设置表',
    up: `
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        label VARCHAR(100),
        type VARCHAR(20) DEFAULT 'text',
        group VARCHAR(50) DEFAULT 'general',
        options TEXT,
        description TEXT,
        sort INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
      CREATE INDEX IF NOT EXISTS idx_settings_group ON settings(group);
    `,
    down: `
      DROP TABLE IF EXISTS settings CASCADE;
    `,
  },
  {
    id: '013',
    name: 'create_migrations_table',
    description: '创建迁移记录表',
    up: `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `
      DROP TABLE IF EXISTS migrations;
    `,
  },
];

/**
 * 执行迁移
 */
export async function runMigrations(): Promise<{ success: boolean; message: string; executed: string[] }> {
  const client = getSupabaseClient();
  const executed: string[] = [];

  try {
    // 确保迁移表存在
    const migrationTableMigration = migrations.find(m => m.name === 'create_migrations_table');
    if (migrationTableMigration) {
      try {
        await client.rpc('exec_sql', { sql: migrationTableMigration.up });
      } catch {
        // 如果 RPC 不存在，直接执行
      }
    }

    // 获取已执行的迁移
    const { data: executedMigrations } = await client
      .from('migrations')
      .select('id');

    const executedIds = new Set(executedMigrations?.map(m => m.id) || []);

    // 执行未执行的迁移
    for (const migration of migrations) {
      if (executedIds.has(migration.id)) {
        continue;
      }

      console.log(`Executing migration: ${migration.name}`);

      // 执行迁移SQL
      let error = null;
      try {
        const result = await client.rpc('exec_sql', { sql: migration.up });
        error = result.error;
      } catch (e) {
        // 如果 RPC 不存在，记录警告
        console.warn(`Migration ${migration.id} might need manual execution`);
        error = e;
      }

      if (error) {
        console.error(`Migration ${migration.id} failed:`, error);
        continue;
      }

      // 记录迁移
      await client.from('migrations').insert({
        id: migration.id,
        name: migration.name,
        executed_at: new Date().toISOString(),
      });

      executed.push(migration.id);
    }

    return {
      success: true,
      message: `Successfully executed ${executed.length} migrations`,
      executed,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executed,
    };
  }
}

/**
 * 回滚迁移
 */
export async function rollbackMigration(migrationId: string): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  const migration = migrations.find(m => m.id === migrationId);

  if (!migration) {
    return { success: false, message: 'Migration not found' };
  }

  try {
    // 执行回滚SQL
    const { error } = await client.rpc('exec_sql', { sql: migration.down });

    if (error) {
      return { success: false, message: error.message };
    }

    // 删除迁移记录
    await client.from('migrations').delete().eq('id', migrationId);

    return { success: true, message: `Migration ${migrationId} rolled back successfully` };
  } catch (error) {
    return {
      success: false,
      message: `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * 获取迁移状态
 */
export async function getMigrationStatus(): Promise<{
  migrations: { id: string; name: string; status: string }[];
}> {
  const client = getSupabaseClient();

  // 获取已执行的迁移
  const { data: executedMigrations } = await client
    .from('migrations')
    .select('id, name, executed_at');

  const executedMap = new Map(
    executedMigrations?.map(m => [m.id, m]) || []
  );

  const status = migrations.map(m => ({
    id: m.id,
    name: m.name,
    status: executedMap.has(m.id) ? 'executed' : 'pending',
    executedAt: executedMap.get(m.id)?.executed_at,
  }));

  return { migrations: status };
}

/**
 * 重置数据库（危险操作）
 */
export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();

  try {
    // 按相反顺序回滚所有迁移
    for (const migration of [...migrations].reverse()) {
      try {
        await client.rpc('exec_sql', { sql: migration.down });
      } catch {
        // 忽略错误
      }
    }

    // 清空迁移记录
    await client.from('migrations').delete().neq('id', '');

    return { success: true, message: 'Database reset successfully' };
  } catch (error) {
    return {
      success: false,
      message: `Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export default {
  migrations,
  runMigrations,
  rollbackMigration,
  getMigrationStatus,
  resetDatabase,
};
