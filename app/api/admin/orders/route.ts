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

// GET - Fetch all orders for admin
export async function GET(request: NextRequest) {
  try {
    const orders = getOrdersStore()

    // Sort by creation date (newest first)
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log("Admin fetching orders, found:", orders.length)

    return NextResponse.json({
      success: true,
      orders: orders,
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
