import { type NextRequest, NextResponse } from "next/server"

// Shared orders store - using a more persistent approach
const getOrdersStore = () => {
  if (typeof global !== "undefined") {
    if (!global.ordersStore) {
      global.ordersStore = []
    }
    return global.ordersStore
  }
  return []
}

// Helper function to generate order ID
function generateOrderId(): string {
  return `ORD${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

// Helper function to generate tracking number
function generateTrackingNumber(): string {
  return `TRK${Math.random().toString(36).substr(2, 12).toUpperCase()}`
}

// GET - Fetch user orders
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll use a mock user ID
    // In production, get this from session
    const mockUserId = "user_123"

    const orders = getOrdersStore()

    // Filter orders by user ID
    const userOrders = orders.filter((order: any) => order.userId === mockUserId)

    // Sort by creation date (newest first)
    userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log("Fetching orders, found:", userOrders.length)

    return NextResponse.json({
      success: true,
      orders: userOrders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Generate order ID and tracking number
    const orderId = generateOrderId()
    const trackingNumber = generateTrackingNumber()

    // Create new order object
    const newOrder = {
      _id: `order_${Date.now()}`,
      orderId,
      userId: "user_123", // Mock user ID
      customer: orderData.customer,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus || "pending",
      paymentId: orderData.paymentId,
      razorpayOrderId: orderData.razorpayOrderId,
      status: "pending", // All orders start as pending, admin needs to confirm them
      promoCode: orderData.promoCode,
      trackingNumber,
      estimatedDelivery: "5-7 business days",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to orders store
    const orders = getOrdersStore()
    orders.push(newOrder)

    console.log("Order created and stored:", newOrder.orderId)
    console.log("Total orders in store:", orders.length)

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
