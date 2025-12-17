import { type NextRequest, NextResponse } from "next/server"

// Mock database - In real app, use MongoDB/PostgreSQL
let wishlistData: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "guest"

    // In real app, fetch from database
    const userWishlist = wishlistData.filter((item) => item.userId === userId)

    return NextResponse.json({
      success: true,
      wishlist: userWishlist,
    })
  } catch (error) {
    console.error("Wishlist GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId = "guest", product } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 })
    }

    // Check if item already exists
    const existingItem = wishlistData.find((item) => item.productId === productId && item.userId === userId)

    if (existingItem) {
      return NextResponse.json({
        success: false,
        message: "Item already in wishlist",
      })
    }

    // Add to wishlist
    const newItem = {
      _id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      product,
      createdAt: new Date().toISOString(),
    }

    wishlistData.push(newItem)

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
      item: newItem,
    })
  } catch (error) {
    console.error("Wishlist POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to add to wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId") || "guest"

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 })
    }

    // Find item before removing
    const existingItem = wishlistData.find((item) => item.productId === productId && item.userId === userId)

    if (!existingItem) {
      return NextResponse.json({ success: false, error: "Item not found in wishlist" }, { status: 404 })
    }

    // Remove from wishlist
    wishlistData = wishlistData.filter((item) => !(item.productId === productId && item.userId === userId))

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    })
  } catch (error) {
    console.error("Wishlist DELETE error:", error)
    return NextResponse.json({ success: false, error: "Failed to remove from wishlist" }, { status: 500 })
  }
}
