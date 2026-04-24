/**
 * @fileoverview 认证工具函数
 * @description 提供JWT令牌验证、密码哈希等认证相关功能
 * @module lib/auth/utils
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/** JWT密钥 */
const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/** JWT过期时间 */
const JWT_EXPIRES_IN = '7d';

/** Token载荷接口 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成JWT令牌
 * @param payload - 令牌载荷
 * @returns JWT令牌
 */
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证JWT令牌
 * @param token - JWT令牌
 * @returns 令牌载荷或null
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 哈希密码
 * @param password - 明文密码
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 验证密码
 * @param password - 明文密码
 * @param hashedPassword - 哈希密码
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
