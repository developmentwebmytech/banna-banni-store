import DashboardLayout from "@/components/dashboard-layout"
import CartPage from "@/components/cart-page"

export default function Cart() {
  return (
    <DashboardLayout activeItem="cart">
      <CartPage />
    </DashboardLayout>
  )
}