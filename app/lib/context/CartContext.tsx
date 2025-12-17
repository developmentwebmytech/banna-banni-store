"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"

interface CartItem {
  _id: string
  productId: string
  quantity: number
  product: {
    _id: string
    name: string
    price: number
    total_price?: number
    oldPrice?: number
    images: string[]
    slug: string
    stock?: number
  }
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartCount: () => number
  loading: boolean
  fetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()

  const fetchCart = async () => {
    if (!session?.user) return

    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.cart || [])
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchCart()
    } else {
      setCartItems([])
    }
  }, [session])

  const addToCart = async (productId: string, quantity = 1) => {
    if (!session?.user) {
      toast.error("Please login to add items to cart")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })

      if (response.ok) {
        await fetchCart()
        toast.success("Added to cart")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to add to cart")
      }
    } catch (error) {
      toast.error("Failed to add to cart")
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        await fetchCart()
        toast.success("Removed from cart")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to remove from cart")
      }
    } catch (error) {
      toast.error("Failed to remove from cart")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!session?.user || quantity < 1) return

    setLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })

      if (response.ok) {
        await fetchCart()
        toast.success("Quantity updated")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update quantity")
      }
    } catch (error) {
      toast.error("Failed to update quantity")
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
      })

      if (response.ok) {
        setCartItems([])
        toast.success("Cart cleared")
      }
    } catch (error) {
      toast.error("Failed to clear cart")
    } finally {
      setLoading(false)
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.total_price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
