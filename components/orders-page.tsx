"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, X, Eye, Copy, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  total: number
  image?: string
}

interface Order {
  _id: string
  orderId: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    state: string
    zipcode: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  promoCode?: string
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [orderToTrack, setOrderToTrack] = useState<Order | null>(null)

  useEffect(() => {
    if (status === "authenticated" || status === "loading") {
      fetchOrders()
    }
  }, [status])

  // Auto-refresh orders every 30 seconds to get latest status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === "authenticated") {
        fetchOrders()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [status])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()

      if (data.success) {
        setOrders(data.orders || [])
      } else {
        toast.error("Failed to load orders.")
      }
    } catch (error) {
      console.error("Error fetching orders", error)
      toast.error("Failed to load orders.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "shipped":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId)
    toast.success("Order ID copied to clipboard!")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order)
    setCancelDialogOpen(true)
  }

  const handleTrackOrder = (order: Order) => {
    setOrderToTrack(order)
    setTrackingDialogOpen(true)
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return

    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${orderToCancel._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Order cancelled successfully!")
        fetchOrders() // Refresh the orders list
      } else {
        toast.error(data.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Failed to cancel order")
    } finally {
      setCancelling(false)
      setCancelDialogOpen(false)
      setOrderToCancel(null)
    }
  }

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF()

    // Set page margins
    const leftMargin = 20
    const rightMargin = 190
    const pageWidth = 210

    // Company Header
    doc.setFontSize(24)
    doc.setTextColor(40, 40, 40)
    doc.text("INVOICE", leftMargin, 30)

    // the entire Company Details (Left side) section:
     doc.setFontSize(10)
     doc.setTextColor(80, 80, 80)
     doc.text("Banna Banni Store", leftMargin, 50)
     doc.text("Third Floor Plot No.3, Ashirbad Ambropark,Saniya Road", leftMargin, 58)
     doc.text("Saniya Hemad, Surat, Gujarat 395010", leftMargin, 66)
     doc.text("Phone: +91 7433999837", leftMargin, 74)
    

    // Invoice Details (Right side)
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const rightStart = 120
    doc.text("Invoice #:", rightStart, 50)
    doc.text(`INV-${order.orderId}`, rightStart + 25, 50)
    doc.text("Order #:", rightStart, 58)
    doc.text(order.orderId, rightStart + 25, 58)
    doc.text("Date:", rightStart, 66)
    doc.text(formatDate(order.createdAt), rightStart + 25, 66)
    doc.text("Status:", rightStart, 74)
    doc.text(order.status.toUpperCase(), rightStart + 25, 74)

    // Customer Details (Left side)
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("BILL TO:", leftMargin, 105)
    doc.setFontSize(10)
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, leftMargin, 115)
    doc.text(order.customer.email, leftMargin, 123)
    doc.text(order.customer.phone, leftMargin, 131)

    // Shipping Address (Right side)
    doc.setFontSize(12)
    doc.text("SHIP TO:", rightStart, 105)
    doc.setFontSize(10)
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, rightStart, 115)

    // Handle long addresses by splitting them
    const address = order.shippingAddress.address
    if (address.length > 30) {
      const addressLines = address.match(/.{1,30}(\s|$)/g) || [address]
      addressLines.forEach((line, index) => {
        doc.text(line.trim(), rightStart, 123 + index * 8)
      })
    } else {
      doc.text(address, rightStart, 123)
    }

    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, rightStart, 131)
    doc.text(`${order.shippingAddress.zipcode}, ${order.shippingAddress.country}`, rightStart, 139)

    // Table Header
    let yPos = 160
    doc.setFillColor(240, 240, 240)
    doc.rect(leftMargin, yPos - 8, rightMargin - leftMargin, 12, "F")

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("ITEM", leftMargin + 2, yPos)
    doc.text("QTY", 120, yPos)
    doc.text("PRICE", 140, yPos)
    doc.text("TOTAL", 165, yPos)

    // Items
    yPos += 15
    doc.setFontSize(9)

    order.items.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
        // Redraw header on new page
        doc.setFillColor(240, 240, 240)
        doc.rect(leftMargin, yPos - 8, rightMargin - leftMargin, 12, "F")
        doc.setFontSize(10)
        doc.text("ITEM", leftMargin + 2, yPos)
        doc.text("QTY", 120, yPos)
        doc.text("PRICE", 140, yPos)
        doc.text("TOTAL", 165, yPos)
        yPos += 15
        doc.setFontSize(9)
      }

      // Handle long product names
      const productName = item.productName
      if (productName.length > 35) {
        const nameLines = productName.match(/.{1,35}(\s|$)/g) || [productName]
        doc.text(nameLines[0].trim(), leftMargin + 2, yPos)
        if (nameLines[1]) {
          doc.text(nameLines[1].trim(), leftMargin + 2, yPos + 6)
        }
      } else {
        doc.text(productName, leftMargin + 2, yPos)
      }

      // Right align numbers
      doc.text(item.quantity.toString(), 125, yPos, { align: "right" })
      doc.text(`₹${item.price.toFixed(2)}`, 155, yPos, { align: "right" })
      doc.text(`₹${item.total.toFixed(2)}`, 185, yPos, { align: "right" })

      yPos += productName.length > 35 ? 18 : 12
    })

    // Totals section
    yPos += 10
    doc.setLineWidth(0.5)
    doc.line(leftMargin, yPos, rightMargin, yPos)
    yPos += 15

    doc.setFontSize(10)

    // Subtotal
    doc.text("Subtotal:", 140, yPos)
    doc.text(`₹${order.subtotal.toFixed(2)}`, 185, yPos, { align: "right" })
    yPos += 10

    // Discount (if any)
    if (order.discount > 0) {
      doc.setTextColor(0, 150, 0)
      doc.text("Discount:", 140, yPos)
      doc.text(`-₹${order.discount.toFixed(2)}`, 185, yPos, { align: "right" })
      yPos += 10
      doc.setTextColor(0, 0, 0)
    }

    // Shipping
    doc.text("Shipping:", 140, yPos)
    doc.setTextColor(0, 150, 0)
    doc.text("FREE", 185, yPos, { align: "right" })
    doc.setTextColor(0, 0, 0)
    yPos += 15

    // Total (highlighted)
    doc.setFontSize(12)
    doc.setFillColor(240, 240, 240)
    doc.rect(135, yPos - 8, 55, 12, "F")
    doc.text("TOTAL:", 140, yPos)
    doc.setTextColor(0, 0, 0)
    doc.text(`₹${order.total.toFixed(2)}`, 185, yPos, { align: "right" })

    // Payment Information
    yPos += 25
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("PAYMENT INFORMATION:", leftMargin, yPos)
    yPos += 10
    doc.text(`Method: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}`, leftMargin, yPos)
    yPos += 8
    doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, leftMargin, yPos)

    // Footer
    yPos += 20
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text("Thank you for your business!", leftMargin, yPos)
    doc.text("For any queries, contact us at support@company.com", leftMargin, yPos + 8)

    // Download
    doc.save(`Invoice-${order.orderId}.pdf`)
    toast.success("Invoice downloaded successfully!")
  }

  if (status === "loading") {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-2">Loading...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to view your orders.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ToastContainer position="bottom-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-600 mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} found
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200">
          <CardContent>
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">When you place orders, they'll appear here</p>
            <Link href="/products">
              <Button className="bg-teal-600 hover:bg-teal-700 cursor-pointer text-white">Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 text-black">
          {orders.map((order) => (
            <Card key={order._id} className="border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyOrderId(order.orderId)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex gap-2">
                      {/* Always show order status - dynamic from backend */}
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border`}>
                        <span className="capitalize">{order.paymentStatus}</span>
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold">₹{order.total.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Order Items Preview */}
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "/shopbycategory1.webp"}
                          alt={item.productName}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{item.productName}</h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-sm font-medium">₹{item.total.toLocaleString("en-IN")}</div>
                    </div>
                  ))}

                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-600 text-center py-2">+{order.items.length - 2} more items</p>
                  )}
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-gray-300 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
                      <DialogHeader>
                        <DialogTitle>Order Details - #{selectedOrder?.orderId}</DialogTitle>
                      </DialogHeader>

                      {selectedOrder && (
                        <div className="space-y-6 p-1 text-black">
                          {/* Order Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge className={`${getStatusColor(selectedOrder.status)} border`}>
                                {getStatusIcon(selectedOrder.status)}
                                <span className="ml-1 capitalize">{selectedOrder.status}</span>
                              </Badge>
                              <Badge className={`${getPaymentStatusColor(selectedOrder.paymentStatus)} border`}>
                                <span className="capitalize">{selectedOrder.paymentStatus}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                          </div>

                          {/* Customer & Shipping Info */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Customer Information</h4>
                              <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                                <p>
                                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                                </p>
                                <p>{selectedOrder.customer.email}</p>
                                <p>{selectedOrder.customer.phone}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Shipping Address</h4>
                              <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                                <p>{selectedOrder.shippingAddress.address}</p>
                                <p>
                                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                                </p>
                                <p>{selectedOrder.shippingAddress.zipcode}</p>
                                <p>{selectedOrder.shippingAddress.country}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="font-medium mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {selectedOrder.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                                  <div className="relative h-16 w-16 bg-white rounded overflow-hidden flex-shrink-0">
                                    <Image
                                      src={item.image || "/shopbycategory1.webp"}
                                      alt={item.productName}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{item.productName}</h5>
                                    <p className="text-sm text-gray-600">
                                      ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-sm font-medium">₹{item.total.toLocaleString("en-IN")}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="border-t pt-4">
                            <div className="space-y-2 bg-gray-50 p-4 rounded">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
                              </div>
                              {selectedOrder.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount:</span>
                                  <span>-₹{selectedOrder.discount.toLocaleString("en-IN")}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span>Shipping:</span>
                                <span className="text-green-600">FREE</span>
                              </div>
                              <div className="flex justify-between font-medium text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment & Delivery Info */}
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">Payment Information</h4>
                              <div className="bg-gray-50 p-3 rounded space-y-1">
                                <p>
                                  Method:{" "}
                                  {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                                </p>
                                <p>
                                  Status: <span className="capitalize">{selectedOrder.paymentStatus}</span>
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Delivery Information</h4>
                              <div className="bg-gray-50 p-3 rounded space-y-1">
                                <p>Estimated: {selectedOrder.estimatedDelivery}</p>
                                {selectedOrder.trackingNumber && <p>Tracking: {selectedOrder.trackingNumber}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-gray-300 hover:bg-gray-50 cursor-pointer"
                    onClick={() => generateInvoice(order)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>

                  {order.status === "shipped" && (
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent border-gray-300 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTrackOrder(order)}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  )}

                  {(order.status === "pending" || order.status === "confirmed") && (
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 bg-transparent border-red-300 hover:bg-red-50 cursor-pointer"
                      onClick={() => handleCancelOrder(order)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Track Order #{orderToTrack?.orderId}
            </DialogTitle>
          </DialogHeader>
          {orderToTrack && (
            <div className="space-y-4 p-1 text-black">
              {/* Tracking Status - Compact */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-base">Current Status</h3>
                  <Badge className={`${getStatusColor(orderToTrack.status)} border text-xs`}>
                    {getStatusIcon(orderToTrack.status)}
                    <span className="ml-1 capitalize">{orderToTrack.status}</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">Last updated: {formatDate(orderToTrack.updatedAt)}</p>
              </div>

              {/* Tracking Information - Grid for mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-blue-600" />
                    Tracking Details
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-medium">
                        {orderToTrack.trackingNumber || "TRK" + orderToTrack.orderId.slice(-6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">{orderToTrack.estimatedDelivery || "3-5 days"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-green-600" />
                    Delivery Address
                  </h4>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">
                      {orderToTrack.customer.firstName} {orderToTrack.customer.lastName}
                    </p>
                    <p className="text-gray-600">{orderToTrack.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {orderToTrack.shippingAddress.city}, {orderToTrack.shippingAddress.zipcode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline - Compact */}
              <div className="bg-white border rounded-lg p-3">
                <h4 className="font-medium mb-3 text-sm">Order Timeline</h4>
                <div className="space-y-3">
                  {/* Order Placed */}
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-xs">Order Placed</p>
                      <p className="text-xs text-gray-600">{formatDate(orderToTrack.createdAt)}</p>
                    </div>
                  </div>

                  {/* Order Confirmed */}
                  {(orderToTrack.status === "confirmed" ||
                    orderToTrack.status === "processing" ||
                    orderToTrack.status === "shipped" ||
                    orderToTrack.status === "delivered") && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">Order Confirmed</p>
                        <p className="text-xs text-gray-500">Order confirmed and being prepared</p>
                      </div>
                    </div>
                  )}

                  {/* Processing */}
                  {(orderToTrack.status === "processing" ||
                    orderToTrack.status === "shipped" ||
                    orderToTrack.status === "delivered") && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">Processing</p>
                        <p className="text-xs text-gray-500">Order packed and prepared</p>
                      </div>
                    </div>
                  )}

                  {/* Shipped */}
                  {(orderToTrack.status === "shipped" || orderToTrack.status === "delivered") && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">Shipped</p>
                        <p className="text-xs text-gray-500">
                          On its way! ID: {orderToTrack.trackingNumber || "TRK" + orderToTrack.orderId.slice(-6)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivered */}
                  {orderToTrack.status === "delivered" ? (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">Delivered</p>
                        <p className="text-xs text-gray-500">Successfully delivered</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-xs text-gray-500">Out for Delivery</p>
                        <p className="text-xs text-gray-400">Will be delivered soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Support - Compact */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-medium mb-2 text-yellow-800 text-sm">Need Help?</h4>
                <p className="text-xs text-yellow-700 mb-2">
                  Questions about your order? Our support team is here to help.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-yellow-700 border-yellow-300 bg-transparent text-xs"
                  >
                    <a
                      href="/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contact Support
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-yellow-700 border-yellow-300 bg-transparent text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        orderToTrack.trackingNumber || "TRK" + orderToTrack.orderId.slice(-6),
                      )
                      toast.success("Tracking number copied!")
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy ID
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order <strong>#{orderToCancel?.orderId}</strong>?
              <br />
              <span className="text-sm text-gray-600 mt-2 block">
                This action cannot be undone. You will receive a refund if payment was already processed.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder} disabled={cancelling}>
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
