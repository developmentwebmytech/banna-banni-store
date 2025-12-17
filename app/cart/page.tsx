"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaTimes, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa"
import Image from "next/image"
import { useCart } from "@/components/context/CartContext"
import { getImageUrl } from "@/app/lib/utils"

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isLoading } = useCart()

  const handleCheckout = () => {
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/login?redirect=/checkout")
      return
    }

    router.push("/checkout")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <section className="relative bg-teal-800 text-white py-16 sm:py-20">
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2">Your Shopping Cart</h2>
          </div>
        </section>
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4">Loading cart...</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-teal-800 text-white py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.png')] bg-cover bg-center pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Your Shopping Cart</h2>
          <p className="text-sm">
            <Link href="/" className="text-gray-300 hover:text-white underline">
              Home
            </Link>{" "}
            / Your Shopping Cart
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <FaShoppingCart className="text-6xl text-gray-300" />
            </div>
            <h1 className="text-2xl font-semibold">Your cart is empty</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/products">
              <button className="bg-teal-700 text-white px-6 py-3 rounded-md hover:bg-teal-800 transition duration-200 cursor-pointer">
                CONTINUE SHOPPING
              </button>
            </Link>
            <p className="text-sm max-w-md mx-auto py-4">
              <span className="font-semibold">Have an account?</span>{" "}
              <Link href="/login" className="text-teal-700 underline">
                Log in
              </Link>{" "}
              to check out faster.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Shopping Cart ({cartCount} items)</h1>
              <button onClick={clearCart} className="text-red-600 hover:text-red-800 text-sm font-medium">
                Clear Cart
              </button>
            </div>

            <div className="grid gap-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg shadow-sm relative"
                >
                  <button
                    onClick={() => removeFromCart(item._id!)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 z-10"
                    aria-label="Remove item"
                  >
                    <FaTimes />
                  </button>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 h-24 relative">
                      <Image
                        src={getImageUrl(item.product?.images?.[0] || "")}
                        alt={item.product?.name || "Product"}
                        fill
                        sizes="96px"
                        className="object-cover rounded"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.product?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.product?.oldPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.product.oldPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-red-600">
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
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                      className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 border rounded min-w-[50px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                      className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                      disabled={typeof item.product?.stock === "number" && item.quantity >= item.product.stock}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-lg font-semibold text-right sm:text-left min-w-[100px]">
                    ₹{((item.product?.total_price || 0) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Subtotal ({cartCount} items):</span>
                <span className="text-2xl font-bold">₹{cartTotal.toLocaleString()}</span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>• Free shipping on orders above ₹79</p>
                <p>• Delivery in 5-7 business days</p>
                <p>• Easy returns within 30 days</p>
              </div>

              <div className="flex flex-wrap gap-4 justify-end">
                <button
                  onClick={handleCheckout}
                  className={`px-8 py-3 cursor-pointer rounded font-semibold transition duration-200 ${
                    status === "loading"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Loading..." : !session ? "Login to Checkout" : "Proceed to Checkout"}
                </button>
                <Link href="/products">
                  <button className="cursor-pointer border border-teal-700 text-teal-700 px-8 py-3 rounded hover:bg-teal-700 hover:text-white transition duration-200">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
