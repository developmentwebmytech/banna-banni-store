"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "./context/CartContext"

interface CartIconProps {
  className?: string
  onClick?: () => void
}

export function CartIcon({ className = "", onClick }: CartIconProps) {
  const { cartCount, openCart } = useCart()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      openCart()
    }
  }

  return (
    <button className={`relative p-2 ${className}`} onClick={handleClick}>
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  )
}
