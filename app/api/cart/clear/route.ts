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

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const sessionId = getSessionId(request)

    const result = await CartItem.deleteMany({ userId: sessionId })

    const response = NextResponse.json({
      success: true,
      message: `Cleared ${result.deletedCount} items from cart`,
    })

    response.cookies.set("cart_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Cart clear error:", error)
    return NextResponse.json({ success: false, error: "Failed to clear cart" }, { status: 500 })
  }
}
