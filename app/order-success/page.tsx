"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, Package, Truck, CreditCard, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/app/hooks/use-toast"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get("orderId")
  const paymentType = searchParams.get("payment")

  useEffect(() => {
    if (orderId || paymentType) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId, paymentType])

  const fetchOrderDetails = async () => {
    try {
      // Simulate order details fetch
      const mockOrderDetails = {
        orderId: orderId || `ORD${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: "confirmed",
        paymentMethod: paymentType === "cod" ? "Cash on Delivery" : "Online Payment",
        paymentStatus: paymentType === "cod" ? "Pending" : "Completed",
        
        estimatedDelivery: "5-7 business days",
        trackingNumber: `TRK${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      }

      setOrderDetails(mockOrderDetails)
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyOrderId = () => {
    if (orderDetails?.orderId) {
      navigator.clipboard.writeText(orderDetails.orderId)
      toast({
        title: "Copied!",
        description: "Order ID copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className=" min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Order Number:</span>
              <div className="flex items-center">
                <span className="font-medium mr-2">#{orderDetails.orderId}</span>
                <Button variant="ghost" size="sm" onClick={copyOrderId} className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">{orderDetails.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Status:</span>
              <span
                className={`font-medium flex items-center ${
                  orderDetails.paymentStatus === "Completed" ? "text-teal-600" : "text-teal-600"
                }`}
              >
                {orderDetails.paymentStatus === "Completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                {orderDetails.paymentStatus}
              </span>
            </div>

           
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-3 text-teal-600" />
            <span>Order confirmation email sent</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Truck className="w-4 h-4 mr-3 text-teal-600" />
            <span>Estimated delivery: {orderDetails?.estimatedDelivery || "5-7 business days"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="w-4 h-4 mr-3 text-teal-600" />
            <span>
              {paymentType === "cod" ? "Payment will be collected on delivery" : "Payment completed successfully"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full bg-teal-500 text-white">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-teal-500 text-white">
            <Link href="/account/orders">View My Orders</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full bg-teal-500 text-white">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Support */}
        <p className="text-xs text-gray-500 mt-6">
          Need help? Contact us at{" "}
          <a href="mailto:support@yourstore.com" className="text-teal-600 hover:underline">
            support@bannabannistore.com
          </a>
        </p>
      </div>
    </div>
  )
}
