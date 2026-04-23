/**
 * @fileoverview Mock 用户存储
 * @description 用于在数据库不可用时存储用户数据
 * @module lib/auth/mockStore
 */

// 使用 globalThis 确保模块级别单例
declare global {
  var __mockUserStore: Map<string, { 
    id: number; 
    name: string; 
    email: string; 
    phone: string | null; 
    password: string; 
    status: boolean; 
    avatar: string | null;
    language: string;
    created_at: string 
  }> | undefined;
  
  var __mockUserIdCounter: number | undefined;
}

// 初始化全局存储
if (!globalThis.__mockUserStore) {
  globalThis.__mockUserStore = new Map();
}

// 初始化计数器
if (globalThis.__mockUserIdCounter === undefined) {
  globalThis.__mockUserIdCounter = 100;
}

// 预置的测试用户
const presetUsers = [
  {
    id: 1,
    name: '測試用戶',
    email: 'test@example.com',
    phone: '0912345678',
    password: '$2b$10$MBVN7lKa4gP/htlqZP.rN.G0qrqlpx9HAbVX9y/dhK.tD4QMfVvRy', // admin123
    status: true,
    avatar: null,
    language: 'zh-TW',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '演示用戶',
    email: 'demo@example.com',
    phone: '0923456789',
    password: '$2b$10$MBVN7lKa4gP/htlqZP.rN.G0qrqlpx9HAbVX9y/dhK.tD4QMfVvRy', // admin123
    status: true,
    avatar: null,
    language: 'zh-TW',
    created_at: new Date().toISOString(),
  },
];

// 初始化预置用户（只初始化一次）
if (globalThis.__mockUserStore.size === 0) {
  presetUsers.forEach(user => {
    globalThis.__mockUserStore!.set(user.email, user);
  });
}

export const mockUsers = {
  /** 获取下一个用户 ID */
  getNextId: () => {
    globalThis.__mockUserIdCounter!++;
    return globalThis.__mockUserIdCounter!;
  },
  
  /** 添加用户 */
  add: (user: { id: number; name: string; email: string; phone: string | null; password: string }) => {
    const fullUser = {
      ...user,
      status: true,
      avatar: null,
      language: 'zh-TW',
      created_at: new Date().toISOString(),
    };
    globalThis.__mockUserStore!.set(user.email, fullUser);
    return fullUser;
  },
  
  /** 根据邮箱查找用户 */
  findByEmail: (email: string) => {
    return globalThis.__mockUserStore!.get(email);
  },
  
  /** 根据手机号查找用户 */
  findByPhone: (phone: string) => {
    for (const user of globalThis.__mockUserStore!.values()) {
      if (user.phone === phone) return user;
    }
    return undefined;
  },
  
  /** 根据邮箱或手机号查找用户 */
  find: (email?: string, phone?: string) => {
    if (email) return globalThis.__mockUserStore!.get(email);
    if (phone) return mockUsers.findByPhone(phone);
    return undefined;
  },
  
  /** 检查邮箱是否已存在 */
  existsByEmail: (email: string) => {
    return globalThis.__mockUserStore!.has(email);
  },
  
  /** 导出所有用户（不含密码） */
  getAll: () => {
    const users: any[] = [];
    globalThis.__mockUserStore!.forEach(user => {
      const { password: _, ...userWithoutPassword } = user;
      users.push(userWithoutPassword);
    });
    return users;
  },
};

export type MockUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  status: boolean;
  avatar: string | null;
  language: string;
  created_at?: string;
};
