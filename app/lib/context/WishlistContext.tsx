"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"

interface WishlistItem {
  _id: string
  productId: string
  product: {
    _id: string
    name: string
    price: number
    total_price?: number
    oldPrice?: number
    images: string[]
    slug: string
    discount?: string
  }
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  isInWishlist: (productId: string) => boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  loading: boolean
  fetchWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()

  const fetchWishlist = async () => {
    if (!session?.user) return

    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.wishlist || [])
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchWishlist()
    } else {
      setWishlistItems([])
    }
  }, [session])

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.productId === productId)
  }

  const addToWishlist = async (productId: string) => {
    if (!session?.user) {
      toast.error("Please login to add items to wishlist")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        await fetchWishlist()
        toast.success("Added to wishlist")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to add to wishlist")
      }
    } catch (error) {
      toast.error("Failed to add to wishlist")
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        await fetchWishlist()
        toast.success("Removed from wishlist")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to remove from wishlist")
      }
    } catch (error) {
      toast.error("Failed to remove from wishlist")
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        loading,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
