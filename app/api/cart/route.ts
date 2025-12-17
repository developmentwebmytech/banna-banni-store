import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {connectDB} from "@/app/lib/db"
import { CartItem } from "@/app/lib/models/cart"
import { v4 as uuidv4 } from "uuid"

function getSessionId(request: NextRequest): string {
  const cookieStore = cookies()
  let sessionId = cookieStore.get("cart_session_id")?.value

  if (!sessionId) {
    sessionId = uuidv4()
  }

  return sessionId
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const sessionId = getSessionId(request)

    const userCartItems = await CartItem.find({ userId: sessionId })

    const totalItems = userCartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = userCartItems.reduce((sum, item) => sum + (item.product?.total_price || 0) * item.quantity, 0)

    const response = NextResponse.json({
      success: true,
      cart: userCartItems,
      totalItems,
      totalAmount,
    })

    response.cookies.set("cart_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Cart GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { productId, quantity = 1, product } = body

    if (!productId || !product) {
      return NextResponse.json({ success: false, message: "Product ID and product data required" }, { status: 400 })
    }

    const sessionId = getSessionId(request)

    const existingItem = await CartItem.findOne({ userId: sessionId, productId })

    if (existingItem) {
      existingItem.quantity += quantity
      await existingItem.save()

      const response = NextResponse.json({
        success: true,
        message: "Updated quantity in cart",
        item: existingItem,
      })

      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      })

      return response
    }

    const newItem = new CartItem({
      userId: sessionId,
      productId,
      quantity,
      product: {
        ...product,
        total_price: product.total_price || product.price,
      },
    })

    await newItem.save()

    const response = NextResponse.json({
      success: true,
      message: "Added to cart",
      item: newItem,
    })

    response.cookies.set("cart_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (error) {
    console.error("Cart POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ success: false, message: "Item ID and quantity required" }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ success: false, message: "Quantity must be at least 1" }, { status: 400 })
    }

    const sessionId = getSessionId(request)

    const item = await CartItem.findOne({ _id: itemId, userId: sessionId })

    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found in cart" }, { status: 404 })
    }

    item.quantity = quantity
    await item.save()

    const response = NextResponse.json({
      success: true,
      message: "Updated cart item",
      item,
    })

    response.cookies.set("cart_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (error) {
    console.error("Cart PATCH error:", error)
    return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json({ success: false, message: "Item ID required" }, { status: 400 })
    }

    const sessionId = getSessionId(request)

    const deletedItem = await CartItem.findOneAndDelete({ _id: itemId, userId: sessionId })

    if (!deletedItem) {
      return NextResponse.json({ success: false, message: "Item not found in cart" }, { status: 404 })
    }

    const response = NextResponse.json({
      success: true,
      message: "Removed from cart",
    })

    response.cookies.set("cart_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (error) {
    console.error("Cart DELETE error:", error)
    return NextResponse.json({ success: false, error: "Failed to remove from cart" }, { status: 500 })
  }
}
