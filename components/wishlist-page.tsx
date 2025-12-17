"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useWishlist } from "@/components/context/WishlistContext"
import { useCart } from "@/components/context/CartContext"
import { getImageUrl } from "@/app/lib/utils"
import { useEffect, useState } from "react"

interface WishlistProduct {
  _id: string
  name: string
  price: number
   total_price?: number
  oldPrice?: number
  discount?: string
  images: string[]
  slug: string
  rating?: number
  stock?: number
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist()
  const { addToCart } = useCart()
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/wishlist?userId=guest")
        const data = await response.json()

        if (data.success) {
          const products = data.wishlist.map((item: any) => item.product).filter(Boolean)
          setWishlistProducts(products)
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlistProducts()
  }, [wishlistItems])

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId)
      setWishlistProducts((prev) => prev.filter((p) => p._id !== productId))
    } catch (error) {
      console.error("Failed to remove item")
    }
  }

  const handleAddToCart = async (product: WishlistProduct) => {
    try {
      await addToCart(product)
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(product._id)
    } catch (error) {
      console.error("Failed to add to cart")
    }
  }

  const clearWishlist = async () => {
    try {
      // Remove all items from wishlist
      for (const productId of wishlistItems) {
        await removeFromWishlist(productId)
      }
      setWishlistProducts([])
    } catch (error) {
      console.error("Failed to clear wishlist")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4">Loading wishlist...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-1">{wishlistCount} items in your wishlist</p>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="text-center py-12 border border-gray-200">
          <CardContent>
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4">Save items you love to your wishlist</p>
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
            {/* Clear Wishlist Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Wishlist Items</h2>
              <Button
                variant="outline"
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Wishlist
              </Button>
            </div>

            {wishlistProducts.map((product) => (
              <Card key={product._id} className="border border-gray-200 relative">
                <CardContent className="p-4">
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 p-1 rounded"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center space-x-4">
                    <div className="relative h-24 w-24 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={getImageUrl(product.images?.[0] || "")}
                        alt={product.name || "Product"}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {product.oldPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.oldPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm font-medium text-red-600">₹{product.total_price?.toLocaleString()}</span>
                      </div>
                      {product.discount && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">
                          {product.discount}
                        </span>
                      )}
                      {product.stock && <p className="text-xs text-gray-400 mt-1">Stock: {product.stock} available</p>}
                      {product.rating !== undefined && (
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < product.rating! ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.073 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
                            </svg>
                          ))}
                        </div>
                      )}
                      {product.slug && (
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-teal-600 hover:underline text-sm mt-1 inline-block"
                        >
                          View Product
                        </Link>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>

                        <div className="text-right text-sm font-medium text-teal-700">
                          ₹{product.total_price?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Wishlist Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Wishlist Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items</span>
                  <span className="text-gray-900">{wishlistCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Value</span>
                  <span className="text-gray-900">
                    ₹{wishlistProducts.reduce((sum, product) => sum + product.total_price, 0).toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Save items you love for later</p>
                    <p>• Get notified of price drops</p>
                    <p>• Share your wishlist with friends</p>
                    <p>• Items stay saved across devices</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    // Add all wishlist items to cart
                    wishlistProducts.forEach((product) => handleAddToCart(product))
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  disabled={wishlistProducts.length === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add All to Cart
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
