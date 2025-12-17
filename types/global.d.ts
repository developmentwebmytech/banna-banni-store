import type { ICoupon } from "@/app/lib/models/coupon"

// Extend the global namespace to include custom properties
declare global {
  namespace NodeJS {
    interface Global {
      couponsStore: ICoupon[]
      nextCouponId: number
      ordersStore: any[] // Assuming ordersStore is also global
      nextOrderId: number // Assuming nextOrderId is also global
    }
  }
}
