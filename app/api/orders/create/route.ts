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

// Helper functions
function generateOrderId(): string {
  return `ORD${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

function generateTrackingNumber(): string {
  return `TRK${Math.random().toString(36).substr(2, 12).toUpperCase()}`
}

// POST - Create new order (dedicated endpoint for checkout)
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    console.log("Received order data:", orderData)

    // Validate required fields
    if (!orderData.customer || !orderData.items || !orderData.total) {
      return NextResponse.json({ success: false, error: "Missing required order data" }, { status: 400 })
    }

    // Generate order ID and tracking number
    const orderId = generateOrderId()
    const trackingNumber = generateTrackingNumber()

    // Create new order object
    const newOrder = {
      _id: `order_${Date.now()}`,
      orderId,
      userId: "user_123", // Mock user ID - replace with actual user ID from session
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

    // Add to shared orders store
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
