import { type NextRequest, NextResponse } from "next/server"

// Remove the static coupons initialization and make it dynamic
const getCouponsStore = () => {
  if (typeof global !== "undefined") {
    if (!global.couponsStore) {
      global.couponsStore = [] // Start with empty array, no static coupons
    }
    return global.couponsStore
  }
  return []
}

// GET - Fetch all coupons for admin
export async function GET() {
  try {
    const coupons = getCouponsStore()

    // Sort by creation date (newest first)
    coupons.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log("Admin fetching coupons, found:", coupons.length)

    return NextResponse.json({
      success: true,
      coupons: coupons,
    })
  } catch (error) {
    console.error("Error fetching admin coupons:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 })
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const couponData = await request.json()

    console.log("Creating coupon with data:", couponData)

    // Validate required fields
    if (!couponData.code || !couponData.discountType || !couponData.discountValue) {
      return NextResponse.json(
        { success: false, error: "Code, discount type, and discount value are required" },
        { status: 400 },
      )
    }

    const coupons = getCouponsStore()

    // Check if coupon code already exists
    const existingCoupon = coupons.find((c: any) => c.code.toUpperCase() === couponData.code.toUpperCase())
    if (existingCoupon) {
      return NextResponse.json({ success: false, error: "Coupon code already exists" }, { status: 400 })
    }

    // Create new coupon object
    const newCoupon = {
      _id: `coupon_${Date.now()}`,
      code: couponData.code.toUpperCase(),
      description: couponData.description || "",
      discountType: couponData.discountType,
      discountValue: Number(couponData.discountValue),
      minPurchase: couponData.minPurchase ? Number(couponData.minPurchase) : undefined,
      maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : undefined,
      expiresAt: couponData.expiresAt || null,
      isActive: couponData.isActive !== false, // Default to true
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to coupons store
    coupons.push(newCoupon)

    console.log("Coupon created and stored:", newCoupon.code)
    console.log("Total coupons in store:", coupons.length)

    return NextResponse.json({
      success: true,
      coupon: newCoupon,
      message: "Coupon created successfully",
    })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 })
  }
}
