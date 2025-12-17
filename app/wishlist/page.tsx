"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useWishlist } from "@/components/context/WishlistContext"
import { useCart } from "@/components/context/CartContext"
import { getImageUrl } from "@/app/lib/utils"
import { toast } from "sonner"

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
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist()
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
      toast.error("Failed to remove item")
    }
  }

  const handleAddToCart = async (product: WishlistProduct) => {
    try {
      await addToCart(product)
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(product._id)
    } catch (error) {
      toast.error("Failed to add to cart")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-800 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        <div className="flex flex-col items-center space-y-6">
          {/* Heart icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 3a5.5 5.5 0 00-4.5 2.4A5.5 5.5 0 007.5 3 5.5 5.5 0 002 8.5c0 2.7 2.1 4.9 5.2 7.4 1.5 1.2 3.2 2.5 4.3 3.3 1.1-.8 2.8-2.1 4.3-3.3 3.1-2.5 5.2-4.7 5.2-7.4A5.5 5.5 0 0016.5 3z"
            />
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Message */}
          <h2 className="text-xl font-semibold text-black">Wishlist is empty.</h2>
          <p className="text-gray-500 max-w-md">
            You don&apos;t have any products in the wishlist yet. You will find a lot of interesting products on our
            &quot;Shop&quot; page.
          </p>

          {/* Button */}
          <Link href="/products">
            <button className="bg-teal-800 text-white px-6 py-2 rounded-md hover:bg-teal-900 transition cursor-pointer">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Heart className="w-5 h-5" />
            <span>{wishlistItems.length} items</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="relative">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative w-full h-64">
                    <Image
                      src={getImageUrl(product.images[0] || "")}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="rounded-t-lg object-cover"
                    />
                  </div>
                </Link>

                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                {product.discount && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-sm px-2 py-1 rounded">
                    {product.discount}
                  </span>
                )}
              </div>

              <div className="p-4">
                {product.rating !== undefined && (
                  <div className="flex items-center mb-2">
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

                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-teal-800 transition-colors">
                    {product.name.length > 60 ? product.name.slice(0, 60) + "..." : product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  {product.oldPrice && (
                    <span className="line-through text-gray-500 text-sm">
                      MRP. {product.oldPrice?.toLocaleString() || "0"}
                    </span>
                  )}
                  <span className="text-red-600 font-bold text-lg">
                    Rs. {product.total_price?.toLocaleString() || product.price?.toLocaleString() || "0"}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-teal-800 text-white py-2 px-4 rounded-md hover:bg-teal-900 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
