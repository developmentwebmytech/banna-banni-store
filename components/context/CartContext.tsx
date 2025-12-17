"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

interface Product {
  _id: string
  name: string
  price: number
  total_price?: number
  oldPrice?: number
  images: string[]
  slug?: string
  stock?: number
}

interface CartItem {
  _id: string
  userId: string
  productId: string
  quantity: number
  product: Product
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  cartCount: number
  cartTotal: number
  isLoading: boolean
}

// Create a default context value to avoid the "undefined" error
const defaultContextValue: CartContextType = {
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  cartCount: 0,
  cartTotal: 0,
  isLoading: true,
}

const CartContext = createContext<CartContextType>(defaultContextValue)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Load cart from API on mount
  useEffect(() => {
    if (isMounted) {
      const fetchCart = async () => {
        try {
          setIsLoading(true)
          const response = await fetch("/api/cart")
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.cart) {
              setCartItems(data.cart)
              return
            }
          }
        } catch (apiError) {
          console.error("API error:", apiError)
        } finally {
          setIsLoading(false)
        }
      }

      fetchCart()
    }
  }, [isMounted])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          product,
        }),
      })

      if (response.ok) {
        const cartResponse = await fetch("/api/cart")
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          if (data.success && data.cart) {
            setCartItems(data.cart)
          }
        }
        toast.success("Added to cart")
        openCart()
      } else {
        toast.error("Failed to add to cart")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error("Something went wrong")
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        const cartResponse = await fetch("/api/cart")
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          if (data.success && data.cart) {
            setCartItems(data.cart)
          }
        }
        toast.success("Item removed from cart")
      } else {
        toast.error("Failed to remove item")
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast.error("Failed to remove item")
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      const response = await fetch(`/api/cart`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (response.ok) {
        const cartResponse = await fetch("/api/cart")
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          if (data.success && data.cart) {
            setCartItems(data.cart)
          }
        }
        toast.success("Quantity updated")
      } else {
        toast.error("Failed to update quantity")
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
      toast.error("Failed to update quantity")
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setCartItems([])
        toast.success("Cart cleared")
      } else {
        toast.error("Failed to clear cart")
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast.error("Failed to clear cart")
    }
  }

  // Calculate cart count and total
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product?.total_price ?? 0) * (item.quantity ?? 0), 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        cartCount,
        cartTotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  return context
}
