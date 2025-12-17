"use client"

import type React from "react"

import { Heart } from "lucide-react"
import { useState } from "react"
import { useWishlist } from "@/components/context/WishlistContext"

interface WishlistButtonProps {
  productId: string
  product?: any
  className?: string
}

export function WishlistButton({ productId, product, className = "" }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  const isWishlisted = isInWishlist(productId)

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)

    try {
      if (isWishlisted) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId, product)
      }
    } catch (error) {
      console.error("Wishlist error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
        } ${isLoading ? "animate-pulse" : ""}`}
      />
    </button>
  )
}
