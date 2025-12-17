import { type NextRequest, NextResponse } from "next/server"

// Define the Order type
interface Order {
  _id: string
  orderId: string
  customer: {
    firstName: string
    lastName: string
    [key: string]: any
  }
  total: number
  status: string
  updatedAt: string
  [key: string]: any
}

// Extend the global object to prevent TypeScript errors
declare global {
  var ordersStore: Order[] | undefined
}

// In-memory orders store
const getOrdersStore = (): Order[] => {
  if (typeof globalThis !== "undefined") {
    if (!globalThis.ordersStore) {
      globalThis.ordersStore = []
    }
    return globalThis.ordersStore
  }
  return []
}

// GET - Fetch specific order by ID for admin
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params
    const orders = getOrdersStore()

    const order = orders.find((order) => order.orderId === orderId || order._id === orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Error fetching admin order:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}

// PATCH - Update order status (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params
    const updateData = await request.json()
    const orders = getOrdersStore()

    const orderIndex = orders.findIndex((order) => order.orderId === orderId || order._id === orderId)

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    console.log(`Order ${orderId} status updated to:`, updateData.status)

    return NextResponse.json({
      success: true,
      order: orders[orderIndex],
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Error updating admin order:", error)
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}

// DELETE - Delete order (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params
    const orders = getOrdersStore()

    const orderIndex = orders.findIndex((order) => order.orderId === orderId || order._id === orderId)

    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const deletedOrder = orders[orderIndex]
    orders.splice(orderIndex, 1)

    console.log(`Order ${orderId} deleted successfully by admin`)

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      deletedOrder: {
        orderId: deletedOrder.orderId,
        customerName: `${deletedOrder.customer.firstName} ${deletedOrder.customer.lastName}`,
        total: deletedOrder.total,
      },
    })
  } catch (error) {
    console.error("Error deleting admin order:", error)
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 })
  }
}
