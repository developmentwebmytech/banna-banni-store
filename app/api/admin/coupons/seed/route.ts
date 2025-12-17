import { type NextRequest, NextResponse } from "next/server"

// Use the same shared storage approach for coupons
const getCouponsStore = () => {
  if (typeof global !== "undefined") {
    if (!global.couponsStore) {
      global.couponsStore = []
    }
    return global.couponsStore
  }
  return []
}

// POST - Seed sample coupons for testing
export async function POST(request: NextRequest) {
  try {
    const coupons = getCouponsStore()

    // Clear existing coupons
    coupons.length = 0

    // Add sample coupons
    const sampleCoupons = [
      {
        _id: "coupon_1703123456789",
        code: "SAVE10",
        description: "Save 10% on your order",
        discountType: "percentage",
        discountValue: 10,
        minPurchase: 500,
        maxDiscount: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "coupon_1703123456790",
        code: "FLAT100",
        description: "Flat ₹100 off on orders above ₹1000",
        discountType: "flat",
        discountValue: 100,
        minPurchase: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "coupon_1703123456791",
        code: "WELCOME20",
        description: "Welcome discount 20% for new users",
        discountType: "percentage",
        discountValue: 20,
        minPurchase: 800,
        maxDiscount: 500,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    coupons.push(...sampleCoupons)

    return NextResponse.json({
      success: true,
      message: `Seeded ${sampleCoupons.length} sample coupons`,
      coupons: coupons,
    })
  } catch (error) {
    console.error("Error seeding coupons:", error)
    return NextResponse.json({ success: false, error: "Failed to seed coupons" }, { status: 500 })
  }
}
