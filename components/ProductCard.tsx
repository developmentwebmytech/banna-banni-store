"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { useWishlist } from "@/app/lib/context/WishlistContext"
import { useCart } from "@/app/lib/context/CartContext"
import { getImageUrl } from "@/app/lib/utils"
import type { IProduct } from "@/app/lib/models/product"

interface ProductCardProps {
  product: IProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist()
  const { addToCart, loading: cartLoading } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlist(product._id.toString()) // Convert ObjectId to string
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart(product._id.toString()) // Convert ObjectId to string
  }

  const inWishlist = isInWishlist(product._id.toString()) // Convert ObjectId to string

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded shadow hover:shadow-lg transition cursor-pointer group">
        <div className="relative">
          <div className="relative w-full h-[500px] overflow-hidden rounded-t">
            <Image
              src={getImageUrl(product.images[0] || "")}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              priority
            />

            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={handleWishlistClick}
              disabled={wishlistLoading}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                inWishlist
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} className={inWishlist ? "fill-current" : ""} />
            </button>

            {/* Add to Cart Button - appears on hover */}
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className={`absolute bottom-3 right-3 p-2 rounded-full bg-blue-500 text-white transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                cartLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:scale-110"
              }`}
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </button>

            {/* Discount Badge */}
            {product.discount && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-sm px-2 py-1 rounded">
                {product.discount}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* Rating */}
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
              <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
            </div>
          )}

          {/* Product Name */}
          <h2 className="text-lg font-semibold mb-2 line-clamp-2">
            {product.name.length > 50 ? product.name.slice(0, 50) + "..." : product.name}
          </h2>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            {product.oldPrice && (
              <span className="line-through text-gray-500 text-sm">MRP ₹{product.oldPrice.toLocaleString()}</span>
            )}
            <span className="text-red-600 font-bold text-lg">₹{product.price.toLocaleString()}</span>
          </div>

          {/* Savings */}
          {product.oldPrice && product.oldPrice > product.price && (
            <div className="mt-1">
              <span className="text-green-600 text-sm font-medium">
                Save ₹{(product.oldPrice - product.price).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
