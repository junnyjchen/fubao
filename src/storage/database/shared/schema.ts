import { pgTable, index, serial, varchar, boolean, timestamp, unique, text, integer, jsonb, numeric, date, bigserial, smallint, bigint, foreignKey, uuid, pgPolicy, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 生成随机UUID的函数
const gen_random_uuid = () => sql`gen_random_uuid()`;


export const ticketNoSeq = pgSequence("ticket_no_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const addresses = pgTable("addresses", {
	id: serial().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	name: varchar({ length: 50 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	province: varchar({ length: 50 }).notNull(),
	city: varchar({ length: 50 }).notNull(),
	district: varchar({ length: 50 }).notNull(),
	address: varchar({ length: 200 }).notNull(),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("addresses_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const articles = pgTable("articles", {
	id: serial().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }),
	cover: varchar({ length: 500 }),
	summary: varchar({ length: 500 }),
	content: text(),
	categoryId: integer("category_id"),
	author: varchar({ length: 50 }),
	authorId: varchar("author_id", { length: 36 }),
	views: integer().default(0),
	likes: integer().default(0),
	isFeatured: boolean("is_featured").default(false),
	status: boolean().default(true).notNull(),
	sort: integer().default(0),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("articles_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("articles_is_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("articles_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("articles_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	unique("articles_slug_unique").on(table.slug),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const articlesLang = pgTable("articles_lang", {
	id: serial().notNull(),
	articleId: integer("article_id").notNull(),
	langCode: varchar("lang_code", { length: 10 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	summary: varchar({ length: 500 }),
	content: text(),
}, (table) => [
	index("articles_lang_article_id_idx").using("btree", table.articleId.asc().nullsLast().op("int4_ops")),
	index("articles_lang_lang_code_idx").using("btree", table.langCode.asc().nullsLast().op("text_ops")),
]);

export const banners = pgTable("banners", {
	id: serial().notNull(),
	title: varchar({ length: 100 }),
	image: varchar({ length: 500 }).notNull(),
	link: varchar({ length: 500 }),
	position: varchar({ length: 50 }).default('home'),
	sort: integer().default(0),
	status: boolean().default(true).notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("banners_position_idx").using("btree", table.position.asc().nullsLast().op("text_ops")),
	index("banners_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
]);

export const cartItems = pgTable("cart_items", {
	id: serial().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	goodsId: integer("goods_id").notNull(),
	quantity: integer().default(1).notNull(),
	selected: boolean().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("cart_items_goods_id_idx").using("btree", table.goodsId.asc().nullsLast().op("int4_ops")),
	index("cart_items_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const categories = pgTable("categories", {
	id: serial().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	parentId: integer("parent_id"),
	icon: varchar({ length: 200 }),
	sort: integer().default(0),
	status: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("categories_slug_unique").on(table.slug),
]);

export const certificates = pgTable("certificates", {
	id: serial().notNull(),
	goodsId: integer("goods_id").notNull(),
	certificateNo: varchar("certificate_no", { length: 50 }).notNull(),
	inspectionResult: text("inspection_result"),
	issueDate: timestamp("issue_date", { withTimezone: true, mode: 'string' }).notNull(),
	validUntil: timestamp("valid_until", { withTimezone: true, mode: 'string' }),
	images: jsonb(),
	issuedBy: varchar("issued_by", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("certificates_certificate_no_idx").using("btree", table.certificateNo.asc().nullsLast().op("text_ops")),
	index("certificates_goods_id_idx").using("btree", table.goodsId.asc().nullsLast().op("int4_ops")),
	unique("certificates_certificate_no_unique").on(table.certificateNo),
]);

export const favorites = pgTable("favorites", {
	id: serial().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	targetType: varchar("target_type", { length: 20 }).notNull(),
	targetId: integer("target_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("favorites_target_type_idx").using("btree", table.targetType.asc().nullsLast().op("text_ops")),
	index("favorites_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const goods = pgTable("goods", {
	id: serial().notNull(),
	merchantId: integer("merchant_id").notNull(),
	categoryId: integer("category_id"),
	name: varchar({ length: 200 }).notNull(),
	subtitle: varchar({ length: 200 }),
	type: integer().default(1).notNull(),
	purpose: varchar({ length: 100 }),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	stock: integer().default(0),
	sales: integer().default(0),
	images: jsonb(),
	mainImage: varchar("main_image", { length: 500 }),
	description: text(),
	isCertified: boolean("is_certified").default(false),
	status: boolean().default(true).notNull(),
	sort: integer().default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("goods_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("goods_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	index("goods_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	index("goods_type_idx").using("btree", table.type.asc().nullsLast().op("int4_ops")),
]);

export const goodsLang = pgTable("goods_lang", {
	id: serial().notNull(),
	goodsId: integer("goods_id").notNull(),
	langCode: varchar("lang_code", { length: 10 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	subtitle: varchar({ length: 200 }),
	description: text(),
}, (table) => [
	index("goods_lang_goods_id_idx").using("btree", table.goodsId.asc().nullsLast().op("int4_ops")),
	index("goods_lang_lang_code_idx").using("btree", table.langCode.asc().nullsLast().op("text_ops")),
]);

export const languages = pgTable("languages", {
	id: serial().notNull(),
	code: varchar({ length: 10 }).notNull(),
	name: varchar({ length: 50 }).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	status: boolean().default(true).notNull(),
}, (table) => [
	index("languages_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	unique("languages_code_unique").on(table.code),
]);

export const merchantUsers = pgTable("merchant_users", {
	id: serial().notNull(),
	merchantId: integer("merchant_id").notNull(),
	userId: varchar("user_id", { length: 36 }),
	username: varchar({ length: 50 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: integer().default(1).notNull(),
	status: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("merchant_users_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	index("merchant_users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const merchants = pgTable("merchants", {
	id: serial().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: integer().default(1).notNull(),
	logo: varchar({ length: 500 }),
	cover: varchar({ length: 500 }),
	description: text(),
	certificationLevel: integer("certification_level").default(1),
	contactName: varchar("contact_name", { length: 50 }),
	contactPhone: varchar("contact_phone", { length: 20 }),
	address: varchar({ length: 500 }),
	province: varchar({ length: 50 }),
	city: varchar({ length: 50 }),
	rating: numeric({ precision: 3, scale:  2 }).default('5.00'),
	totalSales: integer("total_sales").default(0),
	status: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("merchants_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	index("merchants_type_idx").using("btree", table.type.asc().nullsLast().op("int4_ops")),
]);

export const news = pgTable("news", {
	id: serial().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }),
	cover: varchar({ length: 500 }),
	summary: varchar({ length: 500 }),
	content: text(),
	type: integer().default(1),
	source: varchar({ length: 100 }),
	views: integer().default(0),
	isFeatured: boolean("is_featured").default(false),
	status: boolean().default(true).notNull(),
	sort: integer().default(0),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("news_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("news_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	index("news_type_idx").using("btree", table.type.asc().nullsLast().op("int4_ops")),
	unique("news_slug_unique").on(table.slug),
]);

export const newsLang = pgTable("news_lang", {
	id: serial().notNull(),
	newsId: integer("news_id").notNull(),
	langCode: varchar("lang_code", { length: 10 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	summary: varchar({ length: 500 }),
	content: text(),
}, (table) => [
	index("news_lang_lang_code_idx").using("btree", table.langCode.asc().nullsLast().op("text_ops")),
	index("news_lang_news_id_idx").using("btree", table.newsId.asc().nullsLast().op("int4_ops")),
]);

export const orderItems = pgTable("order_items", {
	id: serial().notNull(),
	orderId: integer("order_id").notNull(),
	goodsId: integer("goods_id").notNull(),
	goodsName: varchar("goods_name", { length: 200 }).notNull(),
	goodsImage: varchar("goods_image", { length: 500 }),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	quantity: integer().notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	index("order_items_goods_id_idx").using("btree", table.goodsId.asc().nullsLast().op("int4_ops")),
	index("order_items_order_id_idx").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
]);

export const orders = pgTable("orders", {
	id: serial().notNull(),
	orderNo: varchar("order_no", { length: 32 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	merchantId: integer("merchant_id").notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	payAmount: numeric("pay_amount", { precision: 10, scale:  2 }).notNull(),
	payStatus: integer("pay_status").default(0).notNull(),
	orderStatus: integer("order_status").default(0).notNull(),
	payMethod: varchar("pay_method", { length: 20 }),
	payTime: timestamp("pay_time", { withTimezone: true, mode: 'string' }),
	shippingName: varchar("shipping_name", { length: 50 }),
	shippingPhone: varchar("shipping_phone", { length: 20 }),
	shippingAddress: varchar("shipping_address", { length: 500 }),
	shippingTime: timestamp("shipping_time", { withTimezone: true, mode: 'string' }),
	receiveTime: timestamp("receive_time", { withTimezone: true, mode: 'string' }),
	remark: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("orders_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	index("orders_order_no_idx").using("btree", table.orderNo.asc().nullsLast().op("text_ops")),
	index("orders_order_status_idx").using("btree", table.orderStatus.asc().nullsLast().op("int4_ops")),
	index("orders_pay_status_idx").using("btree", table.payStatus.asc().nullsLast().op("int4_ops")),
	index("orders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("orders_order_no_unique").on(table.orderNo),
]);

export const pageConfigs = pgTable("page_configs", {
	id: serial().notNull(),
	pageKey: varchar("page_key", { length: 50 }).notNull(),
	pageName: varchar("page_name", { length: 100 }).notNull(),
	components: jsonb().notNull(),
	langCode: varchar("lang_code", { length: 10 }).default('zh-TW'),
	status: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("page_configs_lang_code_idx").using("btree", table.langCode.asc().nullsLast().op("text_ops")),
	index("page_configs_page_key_idx").using("btree", table.pageKey.asc().nullsLast().op("text_ops")),
]);

export const reviews = pgTable("reviews", {
	id: serial().notNull(),
	orderId: integer("order_id").notNull(),
	goodsId: integer("goods_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	rating: integer().default(5).notNull(),
	content: text(),
	images: jsonb(),
	status: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("reviews_goods_id_idx").using("btree", table.goodsId.asc().nullsLast().op("int4_ops")),
	index("reviews_order_id_idx").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
	index("reviews_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const adminUsers = pgTable("admin_users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 100 }),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	role: varchar({ length: 20 }).default('admin').notNull(),
	status: boolean().default(true).notNull(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	lastLoginIp: varchar("last_login_ip", { length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("admin_users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	index("admin_users_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
]);

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	password: text(),
	name: varchar({ length: 100 }),
	avatar: varchar({ length: 500 }),
	language: varchar({ length: 10 }).default('zh-TW'),
	status: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

export const videos = pgTable("videos", {
	id: serial().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }),
	cover: varchar({ length: 500 }),
	url: varchar({ length: 500 }).notNull(),
	duration: integer().default(0),
	categoryId: integer("category_id"),
	author: varchar({ length: 50 }),
	authorId: varchar("author_id", { length: 36 }),
	views: integer().default(0),
	likes: integer().default(0),
	isFeatured: boolean("is_featured").default(false),
	status: boolean().default(true).notNull(),
	sort: integer().default(0),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("videos_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("videos_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("videos_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	unique("videos_slug_unique").on(table.slug),
]);

export const searchKeywords = pgTable("search_keywords", {
	id: serial().primaryKey().notNull(),
	keyword: varchar({ length: 100 }).notNull(),
	count: integer().default(1),
	lastSearched: timestamp("last_searched", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_search_keywords_count").using("btree", table.count.desc().nullsFirst().op("int4_ops")),
	index("idx_search_keywords_keyword").using("btree", table.keyword.asc().nullsLast().op("text_ops")),
	unique("search_keywords_keyword_key").on(table.keyword),
]);

export const browseHistory = pgTable("browse_history", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	goodsId: integer("goods_id").notNull(),
	viewTime: timestamp("view_time", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	viewDuration: integer("view_duration").default(0),
}, (table) => [
	index("idx_browse_history_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("idx_browse_history_view_time").using("btree", table.viewTime.desc().nullsFirst().op("timestamptz_ops")),
	unique("browse_history_user_id_goods_id_key").on(table.userId, table.goodsId),
]);

export const announcements = pgTable("announcements", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	type: varchar({ length: 20 }).default('notice').notNull(),
	isPinned: boolean("is_pinned").default(false),
	isActive: boolean("is_active").default(true),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_announcements_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_announcements_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_announcements_is_pinned").using("btree", table.isPinned.asc().nullsLast().op("bool_ops")),
]);

export const feedback = pgTable("feedback", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	type: varchar({ length: 20 }).default('other').notNull(),
	content: text().notNull(),
	contact: varchar({ length: 100 }),
	images: text().array(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	reply: text(),
	replyTime: timestamp("reply_time", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_feedback_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_feedback_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_feedback_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_feedback_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
]);

export const signinConfig = pgTable("signin_config", {
	id: serial().primaryKey().notNull(),
	day: integer().notNull(),
	points: integer().default(5).notNull(),
	bonusPoints: integer("bonus_points").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("signin_config_day_key").on(table.day),
]);

export const userLevels = pgTable("user_levels", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	level: integer().notNull(),
	minPoints: integer("min_points").default(0).notNull(),
	maxPoints: integer("max_points"),
	discount: numeric({ precision: 5, scale:  2 }).default('100'),
	icon: varchar({ length: 255 }),
	color: varchar({ length: 20 }),
	benefits: text().array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("user_levels_level_key").on(table.level),
]);

export const userPoints = pgTable("user_points", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	points: integer().notNull(),
	type: varchar({ length: 20 }).notNull(),
	source: varchar({ length: 50 }),
	sourceId: integer("source_id"),
	description: varchar({ length: 255 }),
	balanceAfter: integer("balance_after"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_points_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_user_points_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
]);

export const tickets = pgTable("tickets", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	ticketNo: varchar("ticket_no", { length: 32 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	priority: varchar({ length: 20 }).default('normal'),
	status: varchar({ length: 20 }).default('pending'),
	content: text().notNull(),
	images: text().array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
	closedAt: timestamp("closed_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_tickets_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_tickets_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_tickets_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	unique("tickets_ticket_no_key").on(table.ticketNo),
]);

export const ticketReplies = pgTable("ticket_replies", {
	id: serial().primaryKey().notNull(),
	ticketId: integer("ticket_id").notNull(),
	userId: integer("user_id"),
	isStaff: boolean("is_staff").default(false),
	content: text().notNull(),
	images: text().array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_ticket_replies_ticket_id").using("btree", table.ticketId.asc().nullsLast().op("int4_ops")),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
	type: varchar({ length: 30 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	link: varchar({ length: 500 }),
	image: varchar({ length: 500 }),
	isRead: boolean("is_read").default(false),
	extraData: jsonb("extra_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	index("idx_notifications_created").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_notifications_read").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_notifications_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const userSignins = pgTable("user_signins", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	signDate: date("sign_date").notNull(),
	continuousDays: integer("continuous_days").default(1),
	pointsEarned: integer("points_earned").default(5),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_signins_date").using("btree", table.signDate.desc().nullsFirst().op("date_ops")),
	index("idx_user_signins_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	unique("user_signins_user_id_sign_date_key").on(table.userId, table.signDate),
]);

export const refunds = pgTable("refunds", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	userId: integer("user_id").notNull(),
	merchantId: integer("merchant_id").notNull(),
	type: varchar({ length: 20 }).notNull(),
	reason: varchar({ length: 255 }).notNull(),
	description: text(),
	images: text().array(),
	amount: numeric({ precision: 10, scale:  2 }),
	status: varchar({ length: 20 }).default('pending').notNull(),
	merchantReply: text("merchant_reply"),
	adminReply: text("admin_reply"),
	trackingNumber: varchar("tracking_number", { length: 100 }),
	trackingCompany: varchar("tracking_company", { length: 100 }),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_refunds_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_refunds_merchant_id").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	index("idx_refunds_order_id").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
	index("idx_refunds_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_refunds_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
]);

export const coupons = pgTable("coupons", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 50 }),
	type: varchar({ length: 20 }).default('discount').notNull(),
	discountType: varchar("discount_type", { length: 20 }).default('fixed').notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  2 }).notNull(),
	minAmount: numeric("min_amount", { precision: 10, scale:  2 }).default('0'),
	maxDiscount: numeric("max_discount", { precision: 10, scale:  2 }),
	totalCount: integer("total_count").default(sql`'-1'`),
	usedCount: integer("used_count").default(0),
	perUserLimit: integer("per_user_limit").default(1),
	receivedCount: integer("received_count").default(0),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	scope: varchar({ length: 20 }).default('all'),
	scopeIds: text("scope_ids"),
	merchantId: integer("merchant_id"),
	isActive: boolean("is_active").default(true),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_coupons_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_coupons_code").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("idx_coupons_merchant").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	unique("coupons_code_key").on(table.code),
]);

export const userCoupons = pgTable("user_coupons", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
	couponId: integer("coupon_id").notNull(),
	orderId: integer("order_id"),
	status: varchar({ length: 20 }).default('unused'),
	receivedAt: timestamp("received_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	usedAt: timestamp("used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_coupons_coupon").using("btree", table.couponId.asc().nullsLast().op("int4_ops")),
	index("idx_user_coupons_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_user_coupons_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const distributionConfig = pgTable("distribution_config", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	level: smallint().notNull(),
	rate: numeric({ precision: 5, scale:  2 }).notNull(),
	teamLeaderRate: numeric("team_leader_rate", { precision: 5, scale:  2 }).default('0'),
	minWithdrawAmount: numeric("min_withdraw_amount", { precision: 10, scale:  2 }).default('100'),
	withdrawFeeRate: numeric("withdraw_fee_rate", { precision: 5, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const userDistribution = pgTable("user_distribution", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	inviteCode: varchar("invite_code", { length: 20 }).notNull(),
	parentId: text("parent_id"),
	parentLevel2Id: text("parent_level_2_id"),
	parentLevel3Id: text("parent_level_3_id"),
	isTeamLeader: boolean("is_team_leader").default(false),
	teamLeaderId: text("team_leader_id"),
	totalCommission: numeric("total_commission", { precision: 12, scale:  2 }).default('0'),
	availableCommission: numeric("available_commission", { precision: 12, scale:  2 }).default('0'),
	frozenCommission: numeric("frozen_commission", { precision: 12, scale:  2 }).default('0'),
	withdrawnCommission: numeric("withdrawn_commission", { precision: 12, scale:  2 }).default('0'),
	teamCount: integer("team_count").default(0),
	directCount: integer("direct_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_distribution_invite_code").using("btree", table.inviteCode.asc().nullsLast().op("text_ops")),
	index("idx_user_distribution_parent_id").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	index("idx_user_distribution_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("user_distribution_user_id_key").on(table.userId),
	unique("user_distribution_invite_code_key").on(table.inviteCode),
]);

export const distributionCommissions = pgTable("distribution_commissions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	fromUserId: text("from_user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	orderId: bigint("order_id", { mode: "number" }).notNull(),
	orderNo: varchar("order_no", { length: 50 }).notNull(),
	orderAmount: numeric("order_amount", { precision: 12, scale:  2 }).notNull(),
	commissionRate: numeric("commission_rate", { precision: 5, scale:  2 }).notNull(),
	commissionAmount: numeric("commission_amount", { precision: 12, scale:  2 }).notNull(),
	level: smallint().notNull(),
	isTeamLeaderBonus: boolean("is_team_leader_bonus").default(false),
	status: smallint().default(0),
	settledAt: timestamp("settled_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_distribution_commissions_order_id").using("btree", table.orderId.asc().nullsLast().op("int8_ops")),
	index("idx_distribution_commissions_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const withdrawals = pgTable("withdrawals", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	fee: numeric({ precision: 12, scale:  2 }).default('0'),
	actualAmount: numeric("actual_amount", { precision: 12, scale:  2 }).notNull(),
	bankName: varchar("bank_name", { length: 50 }),
	bankAccount: varchar("bank_account", { length: 50 }),
	accountName: varchar("account_name", { length: 50 }),
	status: smallint().default(0),
	rejectReason: varchar("reject_reason", { length: 200 }),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_withdrawals_status").using("btree", table.status.asc().nullsLast().op("int2_ops")),
	index("idx_withdrawals_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const videoCategories = pgTable("video_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }),
	description: text(),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("video_categories_slug_key").on(table.slug),
]);

export const wikiCategories = pgTable("wiki_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }),
	description: text(),
	icon: varchar({ length: 50 }),
	parentId: integer("parent_id"),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "wiki_categories_parent_id_fkey"
		}),
	unique("wiki_categories_slug_key").on(table.slug),
]);

export const wikiArticles = pgTable("wiki_articles", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }),
	summary: text(),
	content: text(),
	coverImage: varchar("cover_image", { length: 500 }),
	categoryId: integer("category_id"),
	author: varchar({ length: 100 }),
	views: integer().default(0),
	isFeatured: boolean("is_featured").default(false),
	status: boolean().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_wiki_articles_category").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("idx_wiki_articles_status").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [wikiCategories.id],
			name: "wiki_articles_category_id_fkey"
		}),
	unique("wiki_articles_slug_key").on(table.slug),
]);

export const shares = pgTable("shares", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text(),
	images: jsonb(),
	goodsId: integer("goods_id"),
	status: varchar({ length: 20 }).default('approved'),
	views: integer().default(0),
	likes: integer().default(0),
	isFeatured: boolean("is_featured").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	points: integer().default(0),
	totalPoints: integer("total_points").default(0),
	level: integer().default(1),
	inviteCode: varchar("invite_code", { length: 50 }),
	inviteBy: varchar("invite_by", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("user_profiles_user_id_key").on(table.userId),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	paymentId: varchar("payment_id", { length: 50 }).notNull(),
	orderId: integer("order_id"),
	orderNo: varchar("order_no", { length: 50 }),
	userId: varchar("user_id", { length: 100 }),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('pending'),
	transactionId: varchar("transaction_id", { length: 100 }),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("payments_payment_id_key").on(table.paymentId),
]);

export const userBalances = pgTable("user_balances", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	balance: numeric({ precision: 10, scale:  2 }).default('0'),
	frozenBalance: numeric("frozen_balance", { precision: 10, scale:  2 }).default('0'),
	totalRecharge: numeric("total_recharge", { precision: 10, scale:  2 }).default('0'),
	totalWithdraw: numeric("total_withdraw", { precision: 10, scale:  2 }).default('0'),
	totalConsumed: numeric("total_consumed", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("user_balances_user_id_key").on(table.userId),
]);

export const rechargeRecords = pgTable("recharge_records", {
	id: serial().primaryKey().notNull(),
	rechargeNo: varchar("recharge_no", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
	paymentId: varchar("payment_id", { length: 50 }),
	status: varchar({ length: 20 }).default('pending'),
	bonusAmount: numeric("bonus_amount", { precision: 10, scale:  2 }).default('0'),
	transactionId: varchar("transaction_id", { length: 100 }),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("recharge_records_recharge_no_key").on(table.rechargeNo),
]);

export const invoices = pgTable("invoices", {
	id: serial().primaryKey().notNull(),
	invoiceNo: varchar("invoice_no", { length: 50 }).notNull(),
	orderId: integer("order_id"),
	userId: varchar("user_id", { length: 100 }).notNull(),
	invoiceType: varchar("invoice_type", { length: 20 }).notNull(),
	titleType: varchar("title_type", { length: 20 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	taxNo: varchar("tax_no", { length: 50 }),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: varchar({ length: 20 }).default('pending'),
	email: varchar({ length: 100 }),
	address: text(),
	phone: varchar({ length: 50 }),
	bankName: varchar("bank_name", { length: 100 }),
	bankAccount: varchar("bank_account", { length: 50 }),
	issueTime: timestamp("issue_time", { withTimezone: true, mode: 'string' }),
	pdfUrl: varchar("pdf_url", { length: 500 }),
	remark: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("invoices_invoice_no_key").on(table.invoiceNo),
]);

export const balanceTransactions = pgTable("balance_transactions", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	balanceBefore: numeric("balance_before", { precision: 10, scale:  2 }).notNull(),
	balanceAfter: numeric("balance_after", { precision: 10, scale:  2 }).notNull(),
	relatedId: varchar("related_id", { length: 50 }),
	remark: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const userOauthAccounts = pgTable("user_oauth_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	provider: varchar({ length: 20 }).notNull(),
	providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
	providerEmail: varchar("provider_email", { length: 255 }),
	providerName: varchar("provider_name", { length: 100 }),
	providerAvatar: varchar("provider_avatar", { length: 500 }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("user_oauth_accounts_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("user_oauth_accounts_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("user_oauth_accounts_provider_user_unique").on(table.provider, table.providerUserId),
]);

export const oauthProviders = pgTable("oauth_providers", {
	id: serial().primaryKey().notNull(),
	provider: varchar({ length: 20 }).notNull(),
	displayName: varchar("display_name", { length: 50 }).notNull(),
	clientId: varchar("client_id", { length: 255 }).notNull(),
	clientSecret: varchar("client_secret", { length: 500 }).notNull(),
	redirectUri: varchar("redirect_uri", { length: 500 }),
	scope: varchar({ length: 500 }),
	enabled: boolean().default(false).notNull(),
	iconUrl: varchar("icon_url", { length: 500 }),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("oauth_providers_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	unique("oauth_providers_provider_key").on(table.provider),
	pgPolicy("oauth_providers_允许公开删除", { as: "permissive", for: "delete", to: ["public"], using: sql`true` }),
	pgPolicy("oauth_providers_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("oauth_providers_允许公开写入", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("oauth_providers_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);
