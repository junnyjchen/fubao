<?php
/**
 * 路由配置
 */

use think\Request;

// 解析请求路径和方法
$request = Request::instance();
$path = $request->path();
$method = $request->method();

// 移除前后斜杠
$path = trim($path, '/');

// 路由映射
$routers = [
    // ========== 健康检查 ==========
    'api/health' => ['app\controller\Health::index', ['GET']],
    
    // ========== 会员认证 ==========
    'api/auth/login' => ['app\controller\Auth::login', ['POST']],
    'api/auth/register' => ['app\controller\Auth::register', ['POST']],
    'api/auth/me' => ['app\controller\Auth::me', ['GET']],
    'api/auth/logout' => ['app\controller\Auth::logout', ['POST']],
    'api/auth/sendCode' => ['app\controller\Auth::sendCode', ['POST']],
    'api/auth/loginByPhone' => ['app\controller\Auth::loginByPhone', ['POST']],
    
    // ========== 管理员认证 ==========
    'api/admin/login' => ['app\controller\Admin::login', ['POST']],
    'api/admin/logout' => ['app\controller\Admin::logout', ['POST']],
    'api/admin/me' => ['app\controller\Admin::me', ['GET']],
    'api/admin/changePassword' => ['app\controller\Admin::changePassword', ['POST']],
    
    // ========== 管理员 - 用户管理 ==========
    'api/admin/users' => ['app\controller\admin\User::index', ['GET']],
    'api/admin/users/detail' => ['app\controller\admin\User::detail', ['GET']],
    'api/admin/users/updateStatus' => ['app\controller\admin\User::updateStatus', ['POST']],
    'api/admin/users/delete' => ['app\controller\admin\User::delete', ['POST']],
    
    // ========== 管理员 - 商品管理 ==========
    'api/admin/goods' => ['app\controller\admin\Goods::index', ['GET']],
    'api/admin/goods/create' => ['app\controller\admin\Goods::create', ['POST']],
    'api/admin/goods/update' => ['app\controller\admin\Goods::update', ['POST']],
    'api/admin/goods/delete' => ['app\controller\admin\Goods::delete', ['POST']],
    
    // ========== 管理员 - 分类管理 ==========
    'api/admin/categories' => ['app\controller\admin\Category::index', ['GET']],
    'api/admin/categories/create' => ['app\controller\admin\Category::create', ['POST']],
    'api/admin/categories/update' => ['app\controller\admin\Category::update', ['POST']],
    'api/admin/categories/delete' => ['app\controller\admin\Category::delete', ['POST']],
    
    // ========== 管理员 - 订单管理 ==========
    'api/admin/orders' => ['app\controller\admin\Order::index', ['GET']],
    'api/admin/orders/detail' => ['app\controller\admin\Order::detail', ['GET']],
    'api/admin/orders/updateStatus' => ['app\controller\admin\Order::updateStatus', ['POST']],
    'api/admin/orders/export' => ['app\controller\admin\Order::export', ['GET']],
    
    // ========== 管理员 - Banner管理 ==========
    'api/admin/banners' => ['app\controller\admin\Banner::index', ['GET']],
    'api/admin/banners/create' => ['app\controller\admin\Banner::create', ['POST']],
    'api/admin/banners/update' => ['app\controller\admin\Banner::update', ['POST']],
    'api/admin/banners/delete' => ['app\controller\admin\Banner::delete', ['POST']],
    
    // ========== 管理员 - 统计 ==========
    'api/admin/dashboard' => ['app\controller\admin\Dashboard::index', ['GET']],
    'api/admin/dashboard/sales' => ['app\controller\admin\Dashboard::sales', ['GET']],
    'api/admin/dashboard/goodsRanking' => ['app\controller\admin\Dashboard::goodsRanking', ['GET']],
    'api/admin/dashboard/users' => ['app\controller\admin\Dashboard::users', ['GET']],
    
    // ========== 管理员 - 管理员管理 ==========
    'api/admin/admins' => ['app\controller\Admin::list', ['GET']],
    'api/admin/admins/create' => ['app\controller\Admin::create', ['POST']],
    'api/admin/admins/update' => ['app\controller\Admin::update', ['POST']],
    'api/admin/admins/delete' => ['app\controller\Admin::delete', ['POST']],
    
    // ========== 商家 ==========
    'api/merchants' => ['app\controller\Merchant::index', ['GET']],
    'api/merchants/apply' => ['app\controller\Merchant::apply', ['POST']],
    'api/merchants/mine' => ['app\controller\Merchant::mine', ['GET']],
    'api/merchants/update' => ['app\controller\Merchant::update', ['POST']],
    'api/merchants/review' => ['app\controller\Merchant::review', ['POST']],
    
    // ========== 通知 ==========
    'api/notifications' => ['app\controller\Notification::index', ['GET']],
    'api/notifications/markRead' => ['app\controller\Notification::markRead', ['POST']],
    'api/notifications/markAllRead' => ['app\controller\Notification::markAllRead', ['POST']],
    'api/notifications/delete' => ['app\controller\Notification::delete', ['POST']],
    'api/notifications/unreadCount' => ['app\controller\Notification::unreadCount', ['GET']],
    'api/notifications/send' => ['app\controller\Notification::send', ['POST']],
    
    // ========== 上传 ==========
    'api/upload/image' => ['app\controller\Upload::image', ['POST']],
    'api/upload/images' => ['app\controller\Upload::images', ['POST']],
    'api/upload/goodsImage' => ['app\controller\Upload::goodsImage', ['POST']],
    'api/upload/bannerImage' => ['app\controller\Upload::bannerImage', ['POST']],
    'api/upload/delete' => ['app\controller\Upload::delete', ['POST']],
    
    // ========== 优惠券 ==========
    'api/coupons/available' => ['app\controller\Coupon::available', ['GET']],
    'api/coupons/my' => ['app\controller\Coupon::my', ['GET']],
    'api/coupons/claim' => ['app\controller\Coupon::claim', ['POST']],
    'api/coupons/check' => ['app\controller\Coupon::check', ['POST']],
    
    // ========== OAuth ==========
    'api/oauth/providers' => ['app\controller\OAuth::providers', ['GET']],
    'api/oauth/authorize' => ['app\controller\OAuth::authorize', ['GET']],
    'api/oauth/callback' => ['app\controller\OAuth::callback', ['GET']],
    
    // ========== 商品 ==========
    'api/goods' => ['app\controller\Goods::index', ['GET']],
    'api/goods/list' => ['app\controller\Goods::index', ['GET']],
    'api/goods/featured' => ['app\controller\Goods::featured', ['GET']],
    'api/goods/recommended' => ['app\controller\Goods::recommended', ['GET']],
    'api/goods/hot' => ['app\controller\Goods::hot', ['GET']],
    
    // ========== 分类 ==========
    'api/categories' => ['app\controller\Category::index', ['GET']],
    'api/categories/all' => ['app\controller\Category::all', ['GET']],
    
    // ========== 购物车 ==========
    'api/cart' => ['app\controller\Cart::index', ['GET']],
    'api/cart/add' => ['app\controller\Cart::add', ['POST']],
    'api/cart/update' => ['app\controller\Cart::update', ['POST']],
    'api/cart/remove' => ['app\controller\Cart::delete', ['POST']],
    'api/cart/clear' => ['app\controller\Cart::clear', ['POST']],
    'api/cart/count' => ['app\controller\Cart::count', ['GET']],
    
    // ========== 收藏 ==========
    'api/favorites' => ['app\controller\Favorite::index', ['GET']],
    'api/favorites/add' => ['app\controller\Favorite::add', ['POST']],
    'api/favorites/remove' => ['app\controller\Favorite::remove', ['POST']],
    'api/favorites/check' => ['app\controller\Favorite::check', ['GET']],
    'api/favorites/count' => ['app\controller\Favorite::count', ['GET']],
    
    // ========== 订单 ==========
    'api/orders' => ['app\controller\Order::index', ['GET']],
    'api/orders/create' => ['app\controller\Order::create', ['POST']],
    'api/orders/cancel' => ['app\controller\Order::cancel', ['POST']],
    'api/orders/confirm' => ['app\controller\Order::confirm', ['POST']],
    
    // ========== 地址 ==========
    'api/addresses' => ['app\controller\Address::index', ['GET']],
    'api/addresses/create' => ['app\controller\Address::create', ['POST']],
    'api/addresses/update' => ['app\controller\Address::update', ['POST']],
    'api/addresses/delete' => ['app\controller\Address::delete', ['POST']],
    'api/addresses/setDefault' => ['app\controller\Address::setDefault', ['POST']],
    
    // ========== 管理员 - 文章管理 ==========
    'api/admin/articles' => ['app\controller\Article::index', ['GET']],
    'api/admin/articles/create' => ['app\controller\Article::create', ['POST']],
    'api/admin/articles/update' => ['app\controller\Article::update', ['POST']],
    'api/admin/articles/delete' => ['app\controller\Article::delete', ['POST']],
    
    // ========== 首页 ==========
    'api/home' => ['app\controller\Home::index', ['GET']],
    'api/home/banners' => ['app\controller\Home::banners', ['GET']],
    'api/home/articles' => ['app\controller\Home::articles', ['GET']],
    
    // ========== 文章 ==========
    'api/articles' => ['app\controller\Home::articles', ['GET']],
];

// 支持 RESTful 风格
// /api/goods/123 -> Goods::detail(123)
// /api/orders/456 -> Order::detail(456)
// /api/categories/1/children -> Category::children(1)
// /api/addresses/789 -> Address::detail(789)
if (!isset($routers[$path])) {
    // 尝试匹配带ID的路由
    $parts = explode('/', $path);
    
    // 商品详情: api/goods/123
    if (count($parts) === 3 && $parts[0] === 'api' && $parts[1] === 'goods' && is_numeric($parts[2])) {
        $routers[$path] = ['app\controller\Goods::detail', ['GET']];
    }
    
    // 订单详情: api/orders/456
    if (count($parts) === 3 && $parts[0] === 'api' && $parts[1] === 'orders' && is_numeric($parts[2])) {
        $routers[$path] = ['app\controller\Order::detail', ['GET']];
    }
    
    // 地址详情: api/addresses/789
    if (count($parts) === 3 && $parts[0] === 'api' && $parts[1] === 'addresses' && is_numeric($parts[2])) {
        $routers[$path] = ['app\controller\Address::detail', ['GET']];
    }
    
    // 文章详情: api/articles/123
    if (count($parts) === 3 && $parts[0] === 'api' && $parts[1] === 'articles' && is_numeric($parts[2])) {
        $routers[$path] = ['app\controller\Home::article', ['GET']];
    }
    
    // 商家详情: api/merchants/123
    if (count($parts) === 3 && $parts[0] === 'api' && $parts[1] === 'merchants' && is_numeric($parts[2])) {
        $routers[$path] = ['app\controller\Merchant::detail', ['GET']];
    }
    
    // 分类子分类: api/categories/1/children
    if (count($parts) === 4 && $parts[0] === 'api' && $parts[1] === 'categories' && is_numeric($parts[2]) && $parts[3] === 'children') {
        $routers[$path] = ['app\controller\Category::children', ['GET']];
    }
    
    // 分类商品: api/goods/category/123
    if (count($parts) === 4 && $parts[0] === 'api' && $parts[1] === 'goods' && $parts[2] === 'category' && is_numeric($parts[3])) {
        $routers[$path] = ['app\controller\Goods::byCategory', ['GET']];
    }
}

// 匹配路由
if (isset($routers[$path])) {
    [$controllerAction, $methods] = $routers[$path];
    
    // 检查请求方法
    if (in_array($method, $methods)) {
        [$class, $action] = explode('::', $controllerAction);
        
        try {
            $instance = new $class();
            
            // 如果是详情路由，传递ID参数
            if (preg_match('/\/(\d+)$/', $path, $matches)) {
                $id = (int) $matches[1];
                $instance->$action($id);
            } else {
                $instance->$action();
            }
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'error' => true,
                'message' => $e->getMessage(),
            ], JSON_UNESCAPED_UNICODE);
        }
        exit;
    } else {
        header('Content-Type: application/json');
        http_response_code(405);
        echo json_encode(['error' => true, 'message' => 'Method Not Allowed']);
        exit;
    }
}

// 404
header('Content-Type: application/json');
http_response_code(404);
echo json_encode(['error' => true, 'message' => 'Not Found: ' . $path]);
