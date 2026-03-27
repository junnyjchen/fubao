import { pgTable, index, serial, varchar, boolean, timestamp, unique, text, integer, jsonb, numeric, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
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

export const oauthProviders = pgTable("oauth_providers", {
	id: serial().notNull(),
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
	unique("oauth_providers_provider_unique").on(table.provider),
]);

export const userOauthAccounts = pgTable("user_oauth_accounts", {
	id: uuid().default(sql`gen_random_uuid()`).primaryKey().notNull(),
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
