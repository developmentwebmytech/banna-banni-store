import { type NextRequest, NextResponse } from "next/server"

// Use the same shared orders store
const getOrdersStore = () => {
  if (typeof global !== "undefined") {
    if (!global.ordersStore) {
      global.ordersStore = []
    }
    return global.ordersStore
  }
  return []
}

// POST - Cancel an order
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    const mockUserId = "user_123" // In production, get this from session

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const orders = getOrdersStore()

    // Find order index
    const orderIndex = orders.findIndex(
      (order: any) => (order.orderId === orderId || order._id === orderId) && order.userId === mockUserId,
    )

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = orders[orderIndex]

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel order with status: ${order.status}. Only pending and confirmed orders can be cancelled.`,
        },
        { status: 400 },
      )
    }

    // Update order status to cancelled
    orders[orderIndex] = {
      ...order,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    }

    console.log(`Order ${orderId} cancelled successfully`)

    return NextResponse.json({
      success: true,
      order: orders[orderIndex],
      message: "Order cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ success: false, error: "Failed to cancel order" }, { status: 500 })
  }
}
