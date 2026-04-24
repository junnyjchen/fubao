import { CartPage } from '@/components/cart/CartPage';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function Cart() {
  return (
    <RequireAuth>
      <CartPage />
    </RequireAuth>
  );
}
