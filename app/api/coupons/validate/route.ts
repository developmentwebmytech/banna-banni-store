import { type NextRequest, NextResponse } from "next/server"

// Remove static coupons from validation API too
const getCouponsStore = () => {
  if (typeof global !== "undefined") {
    if (!global.couponsStore) {
      global.couponsStore = [] // Start with empty array
    }
    return global.couponsStore
  }
  return []
}

// POST - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 })
    }

    const coupons = getCouponsStore()

    // Find coupon by code (case insensitive)
    const coupon = coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase() && c.isActive === true)

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 404 })
    }

    // Check if coupon is expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: "Coupon has expired" }, { status: 400 })
    }

    // Check minimum purchase requirement
    if (coupon.minPurchase && orderTotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`,
        },
        { status: 400 },
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue) / 100
      // Apply maximum discount limit if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else if (coupon.discountType === "flat") {
      discountAmount = coupon.discountValue
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal)

    console.log(`Coupon ${code} validated successfully. Discount: ₹${discountAmount}`)

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      message: "Coupon applied successfully",
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 })
  }
}
