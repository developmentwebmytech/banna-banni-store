import { type NextRequest, NextResponse } from "next/server"

// Use the same shared orders store
const getOrdersStore = () => {
  if (typeof global !== "undefined") {
    // Explicitly cast global to any to bypass type error for global properties
    const globalAny = global as any
    if (!globalAny.ordersStore) {
      globalAny.ordersStore = []
    }
    return globalAny.ordersStore
  }
  return []
}

// GET - Fetch specific order by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params // Await params
    const mockUserId = "user_123" // This should come from authentication context

    const orders = getOrdersStore()

    // Find order by ID and user
    const order = orders.find(
      (order: any) => (order.orderId === orderId || order._id === orderId) && order.userId === mockUserId,
    )

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params // Await params
    const updateData = await request.json()
    const mockUserId = "user_123" // This should come from authentication context

    const orders = getOrdersStore()

    // Find order index
    const orderIndex = orders.findIndex(
      (order: any) => (order.orderId === orderId || order._id === orderId) && order.userId === mockUserId,
    )

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const currentOrder = orders[orderIndex]

    // If trying to cancel, validate the current status
    if (updateData.status === "cancelled") {
      if (!["pending", "confirmed"].includes(currentOrder.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot cancel order with status: ${currentOrder.status}. Only pending and confirmed orders can be cancelled.`,
          },
          { status: 400 },
        )
      }
    }

    // Update order
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    console.log(`Order ${orderId} updated successfully. New status: ${updateData.status || "unchanged"}`)

    return NextResponse.json({
      success: true,
      order: orders[orderIndex],
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}
