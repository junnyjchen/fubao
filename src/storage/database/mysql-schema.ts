/**
 * @fileoverview MySQL 数据库 Schema
 * @description Drizzle ORM MySQL Schema 定义
 * @module storage/database/mysql-schema
 */

import { mysqlTable, varchar, text, boolean, timestamp, int, serial, decimal, json, datetime, index, unique } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// =============================================
// 公共字段
// =============================================
const baseColumns = {
  id: int('id').autoincrement().primaryKey(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
};

// =============================================
// 用户表
// =============================================
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().default(() => `REPLACE(UUID(), '-', '')`),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  password: text('password'),
  name: varchar('name', { length: 100 }),
  avatar: varchar('avatar', { length: 500 }),
  language: varchar('language', { length: 10 }).default('zh-TW'),
  status: boolean('status').default(true).notNull(),
  ...baseColumns,
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_phone_idx').on(table.phone),
  unique('users_email_unique').on(table.email),
]);

// =============================================
// 管理员用户表
// =============================================
export const adminUsers = mysqlTable('admin_users', {
  id: int('id').autoincrement().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 20 }).default('admin').notNull(),
  status: boolean('status').default(true).notNull(),
  lastLoginAt: datetime('last_login_at', { mode: 'string' }),
  lastLoginIp: varchar('last_login_ip', { length: 50 }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('admin_users_username_idx').on(table.username),
  index('admin_users_status_idx').on(table.status),
]);

// =============================================
// OAuth提供商表
// =============================================
export const oauthProviders = mysqlTable('oauth_providers', {
  id: int('id').autoincrement().primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  clientId: varchar('client_id', { length: 255 }),
  clientSecret: text('client_secret'),
  enabled: boolean('enabled').default(false).notNull(),
  config: json('config'),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
});

// =============================================
// 用户OAuth账号表
// =============================================
export const userOauthAccounts = mysqlTable('user_oauth_accounts', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: datetime('expires_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('user_oauth_accounts_user_id_idx').on(table.userId),
  unique('user_oauth_accounts_provider_user_idx').on(table.provider, table.providerUserId),
]);

// =============================================
// 收货地址表
// =============================================
export const addresses = mysqlTable('addresses', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  province: varchar('province', { length: 50 }).notNull(),
  city: varchar('city', { length: 50 }).notNull(),
  district: varchar('district', { length: 50 }).notNull(),
  address: varchar('address', { length: 200 }).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('addresses_user_id_idx').on(table.userId),
]);

// =============================================
// 分类表
// =============================================
export const categories = mysqlTable('categories', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }),
  parentId: int('parent_id'),
  icon: varchar('icon', { length: 500 }),
  cover: varchar('cover', { length: 500 }),
  description: text('description'),
  sort: int('sort').default(0),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('categories_parent_id_idx').on(table.parentId),
  index('categories_slug_idx').on(table.slug),
  unique('categories_slug_unique').on(table.slug),
]);

// =============================================
// 商品表
// =============================================
export const goods = mysqlTable('goods', {
  id: int('id').autoincrement().primaryKey(),
  merchantId: int('merchant_id'),
  categoryId: int('category_id'),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  stock: int('stock').default(0),
  images: text('images'),
  cover: varchar('cover', { length: 500 }),
  specs: json('specs'),
  tags: json('tags'),
  isFeatured: boolean('is_featured').default(false),
  isRecommended: boolean('is_recommended').default(false),
  status: boolean('status').default(true).notNull(),
  sort: int('sort').default(0),
  sales: int('sales').default(0),
  views: int('views').default(0),
  likes: int('likes').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('5.00'),
  reviewsCount: int('reviews_count').default(0),
  publishedAt: datetime('published_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('goods_merchant_id_idx').on(table.merchantId),
  index('goods_category_id_idx').on(table.categoryId),
  index('goods_slug_idx').on(table.slug),
  index('goods_status_idx').on(table.status),
  unique('goods_slug_unique').on(table.slug),
]);

// =============================================
// 订单表
// =============================================
export const orders = mysqlTable('orders', {
  id: int('id').autoincrement().primaryKey(),
  orderNo: varchar('order_no', { length: 50 }).notNull().unique(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  merchantId: int('merchant_id'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).default('0.00'),
  actualAmount: decimal('actual_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }),
  paymentStatus: varchar('payment_status', { length: 20 }).default('unpaid').notNull(),
  paymentTime: datetime('payment_time', { mode: 'string' }),
  shippingName: varchar('shipping_name', { length: 50 }),
  shippingPhone: varchar('shipping_phone', { length: 20 }),
  shippingProvince: varchar('shipping_province', { length: 50 }),
  shippingCity: varchar('shipping_city', { length: 50 }),
  shippingDistrict: varchar('shipping_district', { length: 50 }),
  shippingAddress: varchar('shipping_address', { length: 200 }),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  trackingCompany: varchar('tracking_company', { length: 100 }),
  shippedAt: datetime('shipped_at', { mode: 'string' }),
  deliveredAt: datetime('delivered_at', { mode: 'string' }),
  receivedAt: datetime('received_at', { mode: 'string' }),
  remark: text('remark'),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('orders_user_id_idx').on(table.userId),
  index('orders_merchant_id_idx').on(table.merchantId),
  index('orders_order_no_idx').on(table.orderNo),
  index('orders_status_idx').on(table.status),
  index('orders_created_at_idx').on(table.createdAt),
]);

// =============================================
// 订单商品表
// =============================================
export const orderItems = mysqlTable('order_items', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').notNull(),
  goodsId: int('goods_id').notNull(),
  goodsName: varchar('goods_name', { length: 200 }).notNull(),
  goodsImage: varchar('goods_image', { length: 500 }),
  specs: json('specs'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: int('quantity').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
  index('order_items_goods_id_idx').on(table.goodsId),
]);

// =============================================
// 购物车表
// =============================================
export const carts = mysqlTable('carts', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  goodsId: int('goods_id').notNull(),
  quantity: int('quantity').notNull().default(1),
  specs: json('specs'),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('carts_user_id_idx').on(table.userId),
  index('carts_goods_id_idx').on(table.goodsId),
]);

// =============================================
// 收藏表
// =============================================
export const favorites = mysqlTable('favorites', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  goodsId: int('goods_id').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('favorites_user_id_idx').on(table.userId),
  index('favorites_goods_id_idx').on(table.goodsId),
  unique('favorites_user_goods_unique').on(table.userId, table.goodsId),
]);

// =============================================
// 商家表
// =============================================
export const merchants = mysqlTable('merchants', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: int('type').default(1),
  logo: varchar('logo', { length: 500 }),
  cover: varchar('cover', { length: 500 }),
  description: text('description'),
  certificationLevel: int('certification_level').default(1),
  contactName: varchar('contact_name', { length: 50 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  address: varchar('address', { length: 500 }),
  province: varchar('province', { length: 50 }),
  city: varchar('city', { length: 50 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('5.00'),
  totalSales: int('total_sales').default(0),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('merchants_status_idx').on(table.status),
  index('merchants_type_idx').on(table.type),
]);

// =============================================
// 文章表
// =============================================
export const articles = mysqlTable('articles', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  cover: varchar('cover', { length: 500 }),
  summary: varchar('summary', { length: 500 }),
  content: text('content'),
  category: varchar('category', { length: 50 }),
  author: varchar('author', { length: 50 }),
  authorId: varchar('author_id', { length: 36 }),
  views: int('views').default(0),
  likes: int('likes').default(0),
  isFeatured: boolean('is_featured').default(false),
  status: boolean('status').default(true).notNull(),
  sort: int('sort').default(0),
  publishedAt: datetime('published_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('articles_slug_idx').on(table.slug),
  index('articles_category_idx').on(table.category),
  index('articles_status_idx').on(table.status),
  unique('articles_slug_unique').on(table.slug),
]);

// =============================================
// 证书表
// =============================================
export const certificates = mysqlTable('certificates', {
  id: int('id').autoincrement().primaryKey(),
  certificateNo: varchar('certificate_no', { length: 50 }).notNull().unique(),
  goodsId: int('goods_id'),
  userId: varchar('user_id', { length: 36 }),
  merchantId: int('merchant_id'),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  image: varchar('image', { length: 500 }),
  issuedAt: datetime('issued_at', { mode: 'string' }),
  validFrom: datetime('valid_from', { mode: 'string' }),
  validTo: datetime('valid_to', { mode: 'string' }),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('certificates_goods_id_idx').on(table.goodsId),
  index('certificates_user_id_idx').on(table.userId),
  index('certificates_merchant_id_idx').on(table.merchantId),
  index('certificates_certificate_no_idx').on(table.certificateNo),
]);

// =============================================
// 优惠券表
// =============================================
export const coupons = mysqlTable('coupons', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).default('fixed').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal('min_amount', { precision: 10, scale: 2 }).default('0.00'),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  totalCount: int('total_count'),
  usedCount: int('used_count').default(0),
  perUserLimit: int('per_user_limit').default(1),
  validFrom: datetime('valid_from', { mode: 'string' }).notNull(),
  validTo: datetime('valid_to', { mode: 'string' }).notNull(),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('coupons_code_idx').on(table.code),
  index('coupons_status_idx').on(table.status),
]);

// =============================================
// 用户优惠券表
// =============================================
export const userCoupons = mysqlTable('user_coupons', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  couponId: int('coupon_id').notNull(),
  orderId: int('order_id'),
  usedAt: datetime('used_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('user_coupons_user_id_idx').on(table.userId),
  index('user_coupons_coupon_id_idx').on(table.couponId),
]);

// =============================================
// 用户余额表
// =============================================
export const userBalances = mysqlTable('user_balances', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().unique(),
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00'),
  frozenBalance: decimal('frozen_balance', { precision: 10, scale: 2 }).default('0.00'),
  totalRecharge: decimal('total_recharge', { precision: 10, scale: 2 }).default('0.00'),
  totalWithdraw: decimal('total_withdraw', { precision: 10, scale: 2 }).default('0.00'),
  totalExpense: decimal('total_expense', { precision: 10, scale: 2 }).default('0.00'),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('user_balances_user_id_idx').on(table.userId),
]);

// =============================================
// 充值记录表
// =============================================
export const recharges = mysqlTable('recharges', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  orderNo: varchar('order_no', { length: 50 }).notNull().unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(),
  paidAt: datetime('paid_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('recharges_user_id_idx').on(table.userId),
  index('recharges_order_no_idx').on(table.orderNo),
]);

// =============================================
// 余额变动记录表
// =============================================
export const balanceLogs = mysqlTable('balance_logs', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal('balance_before', { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 10, scale: 2 }).notNull(),
  description: varchar('description', { length: 200 }),
  relatedId: int('related_id'),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('balance_logs_user_id_idx').on(table.userId),
  index('balance_logs_type_idx').on(table.type),
]);

// =============================================
// 视频表
// =============================================
export const videos = mysqlTable('videos', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  cover: varchar('cover', { length: 500 }),
  url: varchar('url', { length: 500 }).notNull(),
  duration: int('duration').default(0),
  categoryId: int('category_id'),
  author: varchar('author', { length: 50 }),
  authorId: varchar('author_id', { length: 36 }),
  views: int('views').default(0),
  likes: int('likes').default(0),
  isFeatured: boolean('is_featured').default(false),
  status: boolean('status').default(true).notNull(),
  sort: int('sort').default(0),
  publishedAt: datetime('published_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('videos_category_id_idx').on(table.categoryId),
  index('videos_slug_idx').on(table.slug),
  index('videos_status_idx').on(table.status),
  unique('videos_slug_unique').on(table.slug),
]);

// =============================================
// 新闻表
// =============================================
export const news = mysqlTable('news', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  cover: varchar('cover', { length: 500 }),
  summary: varchar('summary', { length: 500 }),
  content: text('content'),
  author: varchar('author', { length: 50 }),
  authorId: varchar('author_id', { length: 36 }),
  source: varchar('source', { length: 100 }),
  sourceUrl: varchar('source_url', { length: 500 }),
  views: int('views').default(0),
  isFeatured: boolean('is_featured').default(false),
  status: boolean('status').default(true).notNull(),
  sort: int('sort').default(0),
  publishedAt: datetime('published_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('news_slug_idx').on(table.slug),
  index('news_status_idx').on(table.status),
  unique('news_slug_unique').on(table.slug),
]);

// =============================================
// 轮播图表
// =============================================
export const banners = mysqlTable('banners', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  image: varchar('image', { length: 500 }).notNull(),
  link: varchar('link', { length: 500 }),
  linkType: varchar('link_type', { length: 20 }).default('url'),
  position: varchar('position', { length: 50 }).default('home'),
  sort: int('sort').default(0),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('banners_position_idx').on(table.position),
  index('banners_status_idx').on(table.status),
]);

// =============================================
// 公告表
// =============================================
export const announcements = mysqlTable('announcements', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).default('info'),
  isTop: boolean('is_top').default(false),
  status: boolean('status').default(true).notNull(),
  publishedAt: datetime('published_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('announcements_status_idx').on(table.status),
]);

// =============================================
// 会员申请表
// =============================================
export const merchantApplications = mysqlTable('merchant_applications', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: int('type').default(1),
  logo: varchar('logo', { length: 500 }),
  cover: varchar('cover', { length: 500 }),
  description: text('description'),
  contactName: varchar('contact_name', { length: 50 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 20 }).notNull(),
  contactEmail: varchar('contact_email', { length: 100 }),
  province: varchar('province', { length: 50 }),
  city: varchar('city', { length: 50 }),
  address: varchar('address', { length: 200 }),
  licenseImages: text('license_images'),
  IDCardImages: text('ID_card_images'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  rejectReason: text('reject_reason'),
  reviewedAt: datetime('reviewed_at', { mode: 'string' }),
  reviewedBy: int('reviewed_by'),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('merchant_applications_user_id_idx').on(table.userId),
  index('merchant_applications_status_idx').on(table.status),
]);

// =============================================
// 工单表
// =============================================
export const tickets = mysqlTable('tickets', {
  id: int('id').autoincrement().primaryKey(),
  ticketNo: varchar('ticket_no', { length: 50 }).notNull().unique(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  subject: varchar('subject', { length: 200 }).notNull(),
  content: text('content').notNull(),
  images: text('images'),
  priority: varchar('priority', { length: 20 }).default('normal'),
  status: varchar('status', { length: 20 }).default('open').notNull(),
  assignedTo: int('assigned_to'),
  closedAt: datetime('closed_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('tickets_user_id_idx').on(table.userId),
  index('tickets_status_idx').on(table.status),
  index('tickets_type_idx').on(table.type),
]);

// =============================================
// 工单回复表
// =============================================
export const ticketReplies = mysqlTable('ticket_replies', {
  id: int('id').autoincrement().primaryKey(),
  ticketId: int('ticket_id').notNull(),
  userId: varchar('user_id', { length: 36 }),
  adminId: int('admin_id'),
  content: text('content').notNull(),
  images: text('images'),
  isInternal: boolean('is_internal').default(false),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('ticket_replies_ticket_id_idx').on(table.ticketId),
]);

// =============================================
// 评价表
// =============================================
export const reviews = mysqlTable('reviews', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').notNull(),
  goodsId: int('goods_id').notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  rating: int('rating').notNull(),
  content: text('content'),
  images: text('images'),
  reply: text('reply'),
  repliedAt: datetime('replied_at', { mode: 'string' }),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('reviews_goods_id_idx').on(table.goodsId),
  index('reviews_order_id_idx').on(table.orderId),
  index('reviews_user_id_idx').on(table.userId),
]);

// =============================================
// 退款表
// =============================================
export const refunds = mysqlTable('refunds', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').notNull(),
  userId: int('user_id').notNull(),
  merchantId: int('merchant_id').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  description: text('description'),
  images: text('images'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  merchantReply: text('merchant_reply'),
  adminReply: text('admin_reply'),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  trackingCompany: varchar('tracking_company', { length: 100 }),
  processedAt: datetime('processed_at', { mode: 'string' }),
  completedAt: datetime('completed_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('refunds_order_id_idx').on(table.orderId),
  index('refunds_user_id_idx').on(table.userId),
  index('refunds_status_idx').on(table.status),
]);

// =============================================
// 关键词表
// =============================================
export const searchKeywords = mysqlTable('search_keywords', {
  id: int('id').autoincrement().primaryKey(),
  keyword: varchar('keyword', { length: 100 }).notNull(),
  count: int('count').default(1),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
});

// =============================================
// 浏览历史表
// =============================================
export const browseHistory = mysqlTable('browse_history', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  goodsId: int('goods_id').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('browse_history_user_id_idx').on(table.userId),
  index('browse_history_goods_id_idx').on(table.goodsId),
]);

// =============================================
// 会员用户表
// =============================================
export const merchantUsers = mysqlTable('merchant_users', {
  id: int('id').autoincrement().primaryKey(),
  merchantId: int('merchant_id').notNull(),
  userId: varchar('user_id', { length: 36 }),
  username: varchar('username', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: int('role').default(1).notNull(),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('merchant_users_merchant_id_idx').on(table.merchantId),
  index('merchant_users_username_idx').on(table.username),
]);

// =============================================
// 用户签到表
// =============================================
export const userSignins = mysqlTable('user_signins', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  signDate: varchar('sign_date', { length: 10 }).notNull(),
  continuousDays: int('continuous_days').default(1),
  pointsEarned: int('points_earned').default(5),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('idx_user_signins_date').on(table.signDate),
  index('idx_user_signins_user_id').on(table.userId),
]);

// =============================================
// AI配置表
// =============================================
export const aiConfigurations = mysqlTable('ai_configurations', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  apiKey: text('api_key'),
  apiUrl: varchar('api_url', { length: 500 }),
  model: varchar('model', { length: 100 }),
  isDefault: boolean('is_default').default(false),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('ai_configurations_provider_idx').on(table.provider),
]);

// =============================================
// AI生成文章表
// =============================================
export const aiGeneratedArticles = mysqlTable('ai_generated_articles', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  cover: varchar('cover', { length: 500 }),
  summary: varchar('summary', { length: 500 }),
  content: text('content'),
  sourceUrl: varchar('source_url', { length: 500 }),
  sourceLanguage: varchar('source_language', { length: 20 }),
  targetLanguage: varchar('target_language', { length: 20 }),
  keywords: text('keywords'),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  publishedAt: datetime('published_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('ai_generated_articles_status_idx').on(table.status),
]);

// =============================================
// 新闻源表
// =============================================
export const newsSources = mysqlTable('news_sources', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  keywords: text('keywords'),
  language: varchar('language', { length: 20 }),
  targetLanguage: varchar('target_language', { length: 20 }).default('zh-TW'),
  isEnabled: boolean('is_enabled').default(true),
  lastFetchAt: datetime('last_fetch_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('news_sources_is_enabled_idx').on(table.isEnabled),
]);

// =============================================
// 自动发布任务表
// =============================================
export const autoPublishTasks = mysqlTable('auto_publish_tasks', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  cronExpression: varchar('cron_expression', { length: 50 }).notNull(),
  sourceIds: text('source_ids'),
  aiConfigId: int('ai_config_id'),
  isEnabled: boolean('is_enabled').default(true),
  lastRunAt: datetime('last_run_at', { mode: 'string' }),
  nextRunAt: datetime('next_run_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('auto_publish_tasks_is_enabled_idx').on(table.isEnabled),
]);

// =============================================
// 分享表
// =============================================
export const shares = mysqlTable('shares', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  title: varchar('title', { length: 200 }),
  content: text('content'),
  goodsId: int('goods_id'),
  posterUrl: varchar('poster_url', { length: 500 }),
  shareCode: varchar('share_code', { length: 50 }).notNull().unique(),
  clicks: int('clicks').default(0),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('shares_user_id_idx').on(table.userId),
  index('shares_share_code_idx').on(table.shareCode),
]);

// =============================================
// 页面区块表
// =============================================
export const pageBlocks = mysqlTable('page_blocks', {
  id: int('id').autoincrement().primaryKey(),
  page: varchar('page', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  config: json('config'),
  sort: int('sort').default(0),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('page_blocks_page_idx').on(table.page),
  index('page_blocks_status_idx').on(table.status),
]);

// =============================================
// 反馈表
// =============================================
export const feedback = mysqlTable('feedback', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  images: text('images'),
  contact: varchar('contact', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  reply: text('reply'),
  repliedAt: datetime('replied_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('feedback_status_idx').on(table.status),
]);

// =============================================
// 分销表
// =============================================
export const distributions = mysqlTable('distributions', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().unique(),
  parentId: varchar('parent_id', { length: 36 }),
  level: int('level').default(1),
  totalCommission: decimal('total_commission', { precision: 10, scale: 2 }).default('0.00'),
  availableCommission: decimal('available_commission', { precision: 10, scale: 2 }).default('0.00'),
  withdrawnCommission: decimal('withdrawn_commission', { precision: 10, scale: 2 }).default('0.00'),
  teamSize: int('team_size').default(0),
  status: boolean('status').default(true).notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('distributions_user_id_idx').on(table.userId),
  index('distributions_parent_id_idx').on(table.parentId),
]);

// =============================================
// 分销佣金记录表
// =============================================
export const distributionCommissions = mysqlTable('distribution_commissions', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  orderId: int('order_id').notNull(),
  level: int('level').notNull(),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  settledAt: datetime('settled_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('distribution_commissions_user_id_idx').on(table.userId),
  index('distribution_commissions_order_id_idx').on(table.orderId),
]);

// =============================================
// 提现记录表
// =============================================
export const withdrawRequests = mysqlTable('withdraw_requests', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  bankName: varchar('bank_name', { length: 100 }),
  bankAccount: varchar('bank_account', { length: 50 }),
  bankHolder: varchar('bank_holder', { length: 50 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  rejectReason: text('reject_reason'),
  processedAt: datetime('processed_at', { mode: 'string' }),
  processedBy: int('processed_by'),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('withdraw_requests_user_id_idx').on(table.userId),
  index('withdraw_requests_status_idx').on(table.status),
]);

// =============================================
// 积分商品表
// =============================================
export const pointsGoods = mysqlTable('points_goods', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  cover: varchar('cover', { length: 500 }),
  description: text('description'),
  pointsPrice: int('points_price').notNull(),
  stock: int('stock').default(0),
  exchangedCount: int('exchanged_count').default(0),
  status: boolean('status').default(true).notNull(),
  sort: int('sort').default(0),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('points_goods_status_idx').on(table.status),
]);

// =============================================
// 积分兑换记录表
// =============================================
export const pointsExchangeLogs = mysqlTable('points_exchange_logs', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  goodsId: int('goods_id').notNull(),
  pointsAmount: int('points_amount').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('points_exchange_logs_user_id_idx').on(table.userId),
]);

// =============================================
// 通知表
// =============================================
export const notifications = mysqlTable('notifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content'),
  data: json('data'),
  isRead: boolean('is_read').default(false),
  readAt: datetime('read_at', { mode: 'string' }),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
}, (table) => [
  index('notifications_user_id_idx').on(table.userId),
  index('notifications_is_read_idx').on(table.isRead),
]);

// =============================================
// 发票表
// =============================================
export const invoices = mysqlTable('invoices', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  orderId: int('order_id'),
  type: varchar('type', { length: 20 }).default('personal').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  taxNumber: varchar('tax_number', { length: 50 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(new Date().toISOString().slice(0, 19).replace('T', ' ')).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }),
}, (table) => [
  index('invoices_user_id_idx').on(table.userId),
  index('invoices_status_idx').on(table.status),
]);
