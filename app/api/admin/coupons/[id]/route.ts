import { type NextRequest, NextResponse } from "next/server"

// Define Coupon type
interface Coupon {
  _id: string
  code: string
  description?: string
  discountType: string
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  expiresAt?: string | null
  isActive: boolean
  updatedAt: string
}

// Extend the global object
declare global {
  var couponsStore: Coupon[] | undefined
}

// Shared in-memory store
const getCouponsStore = (): Coupon[] => {
  if (typeof globalThis !== "undefined") {
    if (!globalThis.couponsStore) {
      globalThis.couponsStore = []
    }
    return globalThis.couponsStore
  }
  return []
}

// GET - Fetch specific coupon by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: couponId } = await params
    const coupons = getCouponsStore()

    const coupon = coupons.find((c) => c._id === couponId)

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch coupon" }, { status: 500 })
  }
}

// PUT - Update coupon
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: couponId } = await params
    const updateData = await request.json()
    const coupons = getCouponsStore()

    const couponIndex = coupons.findIndex((c) => c._id === couponId)

    if (couponIndex === -1) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 })
    }

    // Validate required fields
    if (!updateData.code || !updateData.discountType || !updateData.discountValue) {
      return NextResponse.json(
        { success: false, error: "Code, discount type, and discount value are required" },
        { status: 400 }
      )
    }

    // Check for existing code
    const existingCoupon = coupons.find(
      (c, index) =>
        c.code.toUpperCase() === updateData.code.toUpperCase() && index !== couponIndex
    )
    if (existingCoupon) {
      return NextResponse.json({ success: false, error: "Coupon code already exists" }, { status: 400 })
    }

    // Update the coupon
    coupons[couponIndex] = {
      ...coupons[couponIndex],
      code: updateData.code.toUpperCase(),
      description: updateData.description || "",
      discountType: updateData.discountType,
      discountValue: Number(updateData.discountValue),
      minPurchase: updateData.minPurchase ? Number(updateData.minPurchase) : undefined,
      maxDiscount: updateData.maxDiscount ? Number(updateData.maxDiscount) : undefined,
      expiresAt: updateData.expiresAt || null,
      isActive: updateData.isActive !== false,
      updatedAt: new Date().toISOString(),
    }

    console.log(`Coupon ${couponId} updated successfully`)

    return NextResponse.json({
      success: true,
      coupon: coupons[couponIndex],
      message: "Coupon updated successfully",
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ success: false, error: "Failed to update coupon" }, { status: 500 })
  }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: couponId } = await params
    const coupons = getCouponsStore()

    const couponIndex = coupons.findIndex((c) => c._id === couponId)

    if (couponIndex === -1) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 })
    }

    const deletedCoupon = coupons[couponIndex]
    coupons.splice(couponIndex, 1)

    console.log(`Coupon ${couponId} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
      deletedCoupon: {
        code: deletedCoupon.code,
        description: deletedCoupon.description,
      },
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 })
  }
}
