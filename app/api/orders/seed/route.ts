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

// POST - Seed sample orders for testing
export async function POST(request: NextRequest) {
  try {
    const orders = getOrdersStore()

    // Clear existing orders
    orders.length = 0

    // Add sample orders
    const sampleOrders = [
      {
        _id: "order_1703123456789",
        orderId: "ORD1703123456_ABC123",
        userId: "user_123",
        customer: {
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "+91 9876543210",
        },
        shippingAddress: {
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipcode: "400001",
          country: "India",
        },
        items: [
          {
            productId: "1",
            productName: "Ayurvedic Pain Relief Spray",
            price: 1800,
            quantity: 2,
            total: 3600,
            image: "/pain relief spray.webp",
          },
          {
            productId: "2",
            productName: "CBD Oil 1500 MG Spectrum",
            price: 1800,
            quantity: 1,
            total: 1800,
            image: "/cbd oil main.webp",
          },
        ],
        subtotal: 5400,
        discount: 540,
        total: 4860,
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "pending", // Changed from "confirmed" to "pending"
        promoCode: "SAVE10",
        trackingNumber: "TRK123456789ABC",
        estimatedDelivery: "5-7 business days",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "order_1703123456790",
        orderId: "ORD1703123456_DEF456",
        userId: "user_123",
        customer: {
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "+91 9876543210",
        },
        shippingAddress: {
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipcode: "400001",
          country: "India",
        },
        items: [
          {
            productId: "1",
            productName: "Ayurvedic Pain Relief Spray",
            price: 1800,
            quantity: 1,
            total: 1800,
            image: "/pain relief spray.webp",
          },
        ],
        subtotal: 1800,
        discount: 0,
        total: 1800,
        paymentMethod: "online",
        paymentStatus: "completed",
        paymentId: "pay_123456789",
        status: "confirmed", // This one can be confirmed as an example
        trackingNumber: "TRK987654321DEF",
        estimatedDelivery: "5-7 business days",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ]

    orders.push(...sampleOrders)

    return NextResponse.json({
      success: true,
      message: `Seeded ${sampleOrders.length} sample orders`,
      orders: orders,
    })
  } catch (error) {
    console.error("Error seeding orders:", error)
    return NextResponse.json({ success: false, error: "Failed to seed orders" }, { status: 500 })
  }
}
