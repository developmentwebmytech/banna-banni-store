"use client"

import type React from "react"

import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { useCart } from "./context/CartContext"

interface AddToCartButtonProps {
  product: any
  quantity?: number
  className?: string
  children?: React.ReactNode
}

export function AddToCartButton({ product, quantity = 1, className = "", children }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    try {
      await addToCart(product, quantity)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 bg-teal-800 text-white py-2 px-4 rounded-md hover:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      {isLoading ? "Adding..." : children || "Add to Cart"}
    </button>
  )
}
