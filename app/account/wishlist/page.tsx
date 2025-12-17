import DashboardLayout from "@/components/dashboard-layout"
import WishlistPage from "@/components/wishlist-page"

export default function Cart() {
  return (
    <DashboardLayout activeItem="cart">
      <WishlistPage />
    </DashboardLayout>
  )
}