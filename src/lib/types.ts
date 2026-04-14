// ==================== 通用类型 ====================

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
  time?: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PageParams {
  page?: number;
  page_size?: number;
}

export interface ListParams extends PageParams {
  keyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ==================== 用户相关 ====================

export interface User {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  status: 'active' | 'inactive' | 'banned';
  level?: number;
  points?: number;
  balance?: number;
  created_at: string;
  updated_at: string;
}

export interface LoginParams {
  account: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  phone?: string;
  email?: string;
  code?: string;
}

// ==================== 商品相关 ====================

export interface Goods {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  images: string[];
  category_id: number;
  category_name?: string;
  merchant_id?: number;
  merchant_name?: string;
  stock: number;
  sales: number;
  views: number;
  likes: number;
  is_featured?: boolean;
  is_recommended?: boolean;
  is_hot?: boolean;
  status: 'active' | 'inactive' | 'deleted';
  tags?: string[];
  specs?: GoodsSpec[];
  created_at: string;
  updated_at: string;
}

export interface GoodsSpec {
  id?: number;
  name: string;
  options: { label: string; price?: number; stock?: number }[];
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number;
  icon?: string;
  image?: string;
  sort: number;
  children?: Category[];
  goods_count?: number;
}

// ==================== 商家相关 ====================

export interface Merchant {
  id: number;
  user_id: number;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  rating?: number;
  goods_count?: number;
  created_at: string;
}

// ==================== 订单相关 ====================

export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  merchant_id?: number;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  freight_amount: number;
  pay_amount: number;
  pay_time?: string;
  address: Address;
  remark?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending' // 待支付
  | 'paid' // 已支付
  | 'shipped' // 已发货
  | 'delivered' // 已收货
  | 'completed' // 已完成
  | 'cancelled' // 已取消
  | 'refunded'; // 已退款

export interface OrderItem {
  id: number;
  order_id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  specs?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Address {
  id: number;
  user_id: number;
  consignee: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: number;
}

// ==================== 购物车相关 ====================

export interface CartItem {
  id: number;
  user_id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  specs?: string;
  price: number;
  quantity: number;
  stock: number;
  checked?: boolean;
}

export interface CartParams {
  goods_id: number;
  quantity: number;
  specs?: string;
}

// ==================== 收藏相关 ====================

export interface Favorite {
  id: number;
  user_id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  price: number;
  created_at: string;
}

// ==================== 文章相关 ====================

export interface Article {
  id: number;
  title: string;
  summary?: string;
  content: string;
  cover_image?: string;
  images?: string[];
  author?: string;
  source?: string;
  views: number;
  likes: number;
  is_featured?: boolean;
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 优惠券相关 ====================

export interface Coupon {
  id: number;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_amount: number;
  max_discount?: number;
  total_count: number;
  remain_count: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'inactive';
  user_coupon_id?: number;
  is_claimed?: boolean;
  is_used?: boolean;
}

// ==================== 通知相关 ====================

export interface Notification {
  id: number;
  user_id: number;
  type: 'system' | 'order' | 'promotion' | 'activity';
  title: string;
  content: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ==================== 首页数据 ====================

export interface HomeData {
  banners: Banner[];
  categories: Category[];
  featured_goods: Goods[];
  recommended_goods: Goods[];
  hot_goods: Goods[];
  articles: Article[];
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
  type: 'goods' | 'article' | 'url' | 'none';
  target_id?: number;
  sort: number;
  status: 'active' | 'inactive';
}

// ==================== 搜索相关 ====================

export interface SearchResult {
  goods: Goods[];
  articles: Article[];
  total: number;
}

// ==================== 认证相关 ====================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
}

// ==================== 统计相关 ====================

export interface Stats {
  goods_count: number;
  user_count: number;
  order_count: number;
  today_order_count: number;
  today_revenue: number;
  revenue: number;
}

export interface ChartData {
  date: string;
  value: number;
}

// ==================== 上传相关 ====================

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

// ==================== 验证相关 ====================

export interface VerifyResult {
  is_valid: boolean;
  goods?: Goods;
  certificate?: Certificate;
  message: string;
}

export interface Certificate {
  id: number;
  goods_id: number;
  certificate_no: string;
  verify_code: string;
  issued_at: string;
  issuer: string;
}

// ==================== 管理员相关 ====================

export interface AdminUser {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'operator';
  permissions?: string[];
  last_login?: string;
  created_at: string;
}

export interface DashboardStats {
  overview: Stats;
  recent_orders: Order[];
  top_goods: Goods[];
  chart_data: ChartData[];
}
