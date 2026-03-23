import { pgTable, serial, varchar, text, timestamp, boolean, integer, decimal, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// ==================== 系统表 ====================
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== 多语言配置 ====================
export const languages = pgTable("languages", {
  id: serial().notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  status: boolean("status").default(true).notNull(),
}, (table) => [
  index("languages_code_idx").on(table.code),
]);

// ==================== 用户表 ====================
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  password: text("password"),
  name: varchar("name", { length: 100 }),
  avatar: varchar("avatar", { length: 500 }),
  language: varchar("language", { length: 10 }).default('zh-TW'),
  status: boolean("status").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_phone_idx").on(table.phone),
]);

// ==================== 商户表（道观/寺庙） ====================
export const merchants = pgTable("merchants", {
  id: serial().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: integer("type").default(1).notNull(),
  logo: varchar("logo", { length: 500 }),
  cover: varchar("cover", { length: 500 }),
  description: text("description"),
  certificationLevel: integer("certification_level").default(1),
  contactName: varchar("contact_name", { length: 50 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: varchar("address", { length: 500 }),
  province: varchar("province", { length: 50 }),
  city: varchar("city", { length: 50 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('5.00'),
  totalSales: integer("total_sales").default(0),
  status: boolean("status").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("merchants_type_idx").on(table.type),
  index("merchants_status_idx").on(table.status),
]);

// ==================== 商户管理员表 ====================
export const merchantUsers = pgTable("merchant_users", {
  id: serial().notNull(),
  merchantId: integer("merchant_id").notNull(),
  userId: varchar("user_id", { length: 36 }),
  username: varchar("username", { length: 50 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: integer("role").default(1).notNull(),
  status: boolean("status").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("merchant_users_merchant_id_idx").on(table.merchantId),
  index("merchant_users_username_idx").on(table.username),
]);

// ==================== 商品分类表 ====================
export const categories = pgTable("categories", {
  id: serial().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  parentId: integer("parent_id"),
  icon: varchar("icon", { length: 200 }),
  sort: integer("sort").default(0),
  status: boolean("status").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("categories_slug_idx").on(table.slug),
  index("categories_parent_id_idx").on(table.parentId),
]);

// ==================== 商品表 ====================
export const goods = pgTable("goods", {
  id: serial().notNull(),
  merchantId: integer("merchant_id").notNull(),
  categoryId: integer("category_id"),
  name: varchar("name", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 200 }),
  type: integer("type").default(1).notNull(),
  purpose: varchar("purpose", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0),
  sales: integer("sales").default(0),
  images: jsonb("images").$type<string[]>(),
  mainImage: varchar("main_image", { length: 500 }),
  description: text("description"),
  isCertified: boolean("is_certified").default(false),
  status: boolean("status").default(true).notNull(),
  sort: integer("sort").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("goods_merchant_id_idx").on(table.merchantId),
  index("goods_category_id_idx").on(table.categoryId),
  index("goods_type_idx").on(table.type),
  index("goods_status_idx").on(table.status),
]);

// ==================== 商品多语言表 ====================
export const goodsLang = pgTable("goods_lang", {
  id: serial().notNull(),
  goodsId: integer("goods_id").notNull(),
  langCode: varchar("lang_code", { length: 10 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 200 }),
  description: text("description"),
}, (table) => [
  index("goods_lang_goods_id_idx").on(table.goodsId),
  index("goods_lang_lang_code_idx").on(table.langCode),
]);

// ==================== 认证证书表 ====================
export const certificates = pgTable("certificates", {
  id: serial().notNull(),
  goodsId: integer("goods_id").notNull(),
  certificateNo: varchar("certificate_no", { length: 50 }).notNull().unique(),
  inspectionResult: text("inspection_result"),
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  images: jsonb("images").$type<string[]>(),
  issuedBy: varchar("issued_by", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("certificates_goods_id_idx").on(table.goodsId),
  index("certificates_certificate_no_idx").on(table.certificateNo),
]);

// ==================== 订单表 ====================
export const orders = pgTable("orders", {
  id: serial().notNull(),
  orderNo: varchar("order_no", { length: 32 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  merchantId: integer("merchant_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  payAmount: decimal("pay_amount", { precision: 10, scale: 2 }).notNull(),
  payStatus: integer("pay_status").default(0).notNull(),
  orderStatus: integer("order_status").default(0).notNull(),
  payMethod: varchar("pay_method", { length: 20 }),
  payTime: timestamp("pay_time", { withTimezone: true }),
  shippingName: varchar("shipping_name", { length: 50 }),
  shippingPhone: varchar("shipping_phone", { length: 20 }),
  shippingAddress: varchar("shipping_address", { length: 500 }),
  shippingTime: timestamp("shipping_time", { withTimezone: true }),
  receiveTime: timestamp("receive_time", { withTimezone: true }),
  remark: varchar("remark", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("orders_order_no_idx").on(table.orderNo),
  index("orders_user_id_idx").on(table.userId),
  index("orders_merchant_id_idx").on(table.merchantId),
  index("orders_pay_status_idx").on(table.payStatus),
  index("orders_order_status_idx").on(table.orderStatus),
]);

// ==================== 订单商品明细表 ====================
export const orderItems = pgTable("order_items", {
  id: serial().notNull(),
  orderId: integer("order_id").notNull(),
  goodsId: integer("goods_id").notNull(),
  goodsName: varchar("goods_name", { length: 200 }).notNull(),
  goodsImage: varchar("goods_image", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index("order_items_order_id_idx").on(table.orderId),
  index("order_items_goods_id_idx").on(table.goodsId),
]);

// ==================== 百科文章表 ====================
export const articles = pgTable("articles", {
  id: serial().notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  cover: varchar("cover", { length: 500 }),
  summary: varchar("summary", { length: 500 }),
  content: text("content"),
  categoryId: integer("category_id"),
  author: varchar("author", { length: 50 }),
  authorId: varchar("author_id", { length: 36 }),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  isFeatured: boolean("is_featured").default(false),
  status: boolean("status").default(true).notNull(),
  sort: integer("sort").default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("articles_slug_idx").on(table.slug),
  index("articles_category_id_idx").on(table.categoryId),
  index("articles_status_idx").on(table.status),
  index("articles_is_featured_idx").on(table.isFeatured),
]);

// ==================== 文章多语言表 ====================
export const articlesLang = pgTable("articles_lang", {
  id: serial().notNull(),
  articleId: integer("article_id").notNull(),
  langCode: varchar("lang_code", { length: 10 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: varchar("summary", { length: 500 }),
  content: text("content"),
}, (table) => [
  index("articles_lang_article_id_idx").on(table.articleId),
  index("articles_lang_lang_code_idx").on(table.langCode),
]);

// ==================== 视频表 ====================
export const videos = pgTable("videos", {
  id: serial().notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  cover: varchar("cover", { length: 500 }),
  url: varchar("url", { length: 500 }).notNull(),
  duration: integer("duration").default(0),
  categoryId: integer("category_id"),
  author: varchar("author", { length: 50 }),
  authorId: varchar("author_id", { length: 36 }),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  isFeatured: boolean("is_featured").default(false),
  status: boolean("status").default(true).notNull(),
  sort: integer("sort").default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("videos_slug_idx").on(table.slug),
  index("videos_category_id_idx").on(table.categoryId),
  index("videos_status_idx").on(table.status),
]);

// ==================== 新闻动态表 ====================
export const news = pgTable("news", {
  id: serial().notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  cover: varchar("cover", { length: 500 }),
  summary: varchar("summary", { length: 500 }),
  content: text("content"),
  type: integer("type").default(1),
  source: varchar("source", { length: 100 }),
  views: integer("views").default(0),
  isFeatured: boolean("is_featured").default(false),
  status: boolean("status").default(true).notNull(),
  sort: integer("sort").default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("news_slug_idx").on(table.slug),
  index("news_type_idx").on(table.type),
  index("news_status_idx").on(table.status),
]);

// ==================== 新闻多语言表 ====================
export const newsLang = pgTable("news_lang", {
  id: serial().notNull(),
  newsId: integer("news_id").notNull(),
  langCode: varchar("lang_code", { length: 10 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: varchar("summary", { length: 500 }),
  content: text("content"),
}, (table) => [
  index("news_lang_news_id_idx").on(table.newsId),
  index("news_lang_lang_code_idx").on(table.langCode),
]);

// ==================== 页面配置表 ====================
export const pageConfigs = pgTable("page_configs", {
  id: serial().notNull(),
  pageKey: varchar("page_key", { length: 50 }).notNull(),
  pageName: varchar("page_name", { length: 100 }).notNull(),
  components: jsonb("components").notNull(),
  langCode: varchar("lang_code", { length: 10 }).default('zh-TW'),
  status: boolean("status").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("page_configs_page_key_idx").on(table.pageKey),
  index("page_configs_lang_code_idx").on(table.langCode),
]);

// ==================== Banner轮播图表 ====================
export const banners = pgTable("banners", {
  id: serial().notNull(),
  title: varchar("title", { length: 100 }),
  image: varchar("image", { length: 500 }).notNull(),
  link: varchar("link", { length: 500 }),
  position: varchar("position", { length: 50 }).default('home'),
  sort: integer("sort").default(0),
  status: boolean("status").default(true).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("banners_position_idx").on(table.position),
  index("banners_status_idx").on(table.status),
]);

// ==================== 用户收藏表 ====================
export const favorites = pgTable("favorites", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("favorites_user_id_idx").on(table.userId),
  index("favorites_target_type_idx").on(table.targetType),
]);

// ==================== 用户收货地址表 ====================
export const addresses = pgTable("addresses", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  province: varchar("province", { length: 50 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  district: varchar("district", { length: 50 }).notNull(),
  address: varchar("address", { length: 200 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("addresses_user_id_idx").on(table.userId),
]);

// ==================== 购物车表 ====================
export const cartItems = pgTable("cart_items", {
  id: serial().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  goodsId: integer("goods_id").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  selected: boolean("selected").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("cart_items_user_id_idx").on(table.userId),
  index("cart_items_goods_id_idx").on(table.goodsId),
]);

// ==================== 商品评价表 ====================
export const reviews = pgTable("reviews", {
  id: serial().notNull(),
  orderId: integer("order_id").notNull(),
  goodsId: integer("goods_id").notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  rating: integer("rating").default(5).notNull(),
  content: text("content"),
  images: jsonb("images").$type<string[]>(),
  status: boolean("status").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("reviews_order_id_idx").on(table.orderId),
  index("reviews_goods_id_idx").on(table.goodsId),
  index("reviews_user_id_idx").on(table.userId),
]);
