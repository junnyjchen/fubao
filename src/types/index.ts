export interface Merchant {
  id: number; name: string; logo: string | null; certification_level: number;
  rating: number; total_sales: number;
}
export interface Category { id: number; name: string; slug: string; }
export interface Goods {
  id: number; name: string; subtitle?: string; main_image: string | null;
  price: string; original_price: string | null; is_certified: boolean; sales: number;
  stock?: number; merchant?: Merchant; category?: Category;
}
export interface News {
  id: number; title: string; slug: string | null; cover: string | null;
  summary: string | null; content?: string; type: number; views: number;
  published_at: string | null;
}
export interface Article {
  id: number; title: string; slug: string | null; cover_image: string | null;
  summary: string | null; view_count: number; created_at: string;
}
export interface Order {
  id: number; order_no: string; status: number; total_amount: string;
  items: OrderItem[]; created_at: string;
}
export interface OrderItem {
  id: number; goods_id: number; goods_name: string; main_image: string;
  price: string; quantity: number;
}
export interface User { id: number; name: string; email: string; avatar?: string; is_admin: boolean; }
export interface ApiResponse<T> {
  data: T; pagination?: { page: number; limit: number; total: number; total_pages: number };
}
