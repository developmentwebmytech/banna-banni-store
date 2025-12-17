"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/components/context/CartContext"
import { getImageUrl } from "@/app/lib/utils"

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isLoading } = useCart()

  const isSessionLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  const handleCheckout = () => {
    if (isSessionLoading) {
      return
    }

    if (!session) {
      router.push("/login?redirect=/checkout")
      return
    }

    router.push("/checkout")
  }

  if (isSessionLoading || isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4">Loading cart...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600 mb-4">You need to be signed in to view your cart.</p>
        <Link href="/login">
          <Button className="bg-teal-600 hover:bg-teal-700">Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Shopping Cart</h1>
        <p className="text-gray-600 mt-1">{cartCount} items in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200">
          <CardContent>
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some items to get started</p>
            <Link href="/products">
              <Button className="border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Cart Items</h2>
              <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700 bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {cartItems.map((item) => (
              <Card key={item._id} className="border border-gray-200 relative">
                <CardContent className="p-4">
                  <button
                    onClick={() => removeFromCart(item._id!)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 p-1 rounded"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center space-x-4">
                    <div className="relative h-24 w-24 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={getImageUrl(item.product?.images?.[0] || "") || "/placeholder.svg?height=96&width=96"}
                        alt={item.product?.name || "Product"}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{item.product?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.product?.oldPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.product.oldPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm font-medium text-red-600">
                          ₹{item.product?.total_price?.toLocaleString()}
                        </span>
                      </div>
                      {item.product?.stock !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">Stock: {item.product.stock} available</p>
                      )}
                      {item.product?.slug && (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-teal-600 hover:underline text-sm mt-1 inline-block"
                        >
                          View Product
                        </Link>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 py-1 border rounded min-w-[40px] text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                            disabled={Boolean(item.product?.stock && item.quantity >= item.product.stock)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right text-sm font-medium text-teal-700">
                          ₹{((item.product?.total_price || 0) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="text-gray-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-teal-700">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Free shipping on orders above ₹79</p>
                  <p>• Delivery in 5-7 business days</p>
                  <p>• Easy returns within 30 days</p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  disabled={isSessionLoading}
                >
                  {isSessionLoading ? "Loading..." : !session ? "Login to Checkout" : "Proceed to Checkout"}
                </Button>
                <Link href="/products" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white bg-transparent"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
