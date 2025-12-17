"use client"

import type React from "react"

import { Heart } from "lucide-react"
import { useWishlist } from "@/app/lib/context/WishlistContext"

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: number
}

export default function WishlistButton({ productId, className = "", size = 20 }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, loading } = useWishlist()

  const inWishlist = isInWishlist(productId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlist(productId)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${
        inWishlist ? "bg-red-500 text-white shadow-lg" : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
      } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"} ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={size} className={inWishlist ? "fill-current" : ""} />
    </button>
  )
}
