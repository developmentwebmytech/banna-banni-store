"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface WishlistContextType {
  wishlistItems: string[]
  addToWishlist: (productId: string, product?: any) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

// Create a default context value to avoid the "undefined" error
const defaultContextValue: WishlistContextType = {
  wishlistItems: [],
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
}

const WishlistContext = createContext<WishlistContextType>(defaultContextValue)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    console.log("WishlistProvider mounted")
    setIsMounted(true)
    return () => {
      console.log("WishlistProvider unmounted")
      setIsMounted(false)
    }
  }, [])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (isMounted) {
      console.log("Loading wishlist from localStorage")
      const saved = localStorage.getItem("wishlist-items")
      if (saved) {
        try {
          const items = JSON.parse(saved)
          console.log("Loaded wishlist items:", items)
          setWishlistItems(items)
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage:", error)
        }
      }
    }
  }, [isMounted])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isMounted) {
      console.log("Saving wishlist to localStorage:", wishlistItems)
      localStorage.setItem("wishlist-items", JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, isMounted])

  const addToWishlist = async (productId: string, product?: any) => {
    console.log("Adding to wishlist:", productId, product)

    if (wishlistItems.includes(productId)) {
      console.log("Item already in wishlist")
      toast.info("Item already in wishlist")
      return
    }

    try {
      // Update local state first for better UX
      setWishlistItems((prev) => {
        console.log("Previous wishlist items:", prev)
        const newItems = [...prev, productId]
        console.log("New wishlist items:", newItems)
        return newItems
      })
      toast.success("Added to wishlist")

      // Then update API
      try {
        console.log("Sending API request to add to wishlist")
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            userId: "guest",
            product,
          }),
        })

        if (!response.ok) {
          console.error("API error when adding to wishlist")
        } else {
          console.log("API response:", await response.json())
        }
      } catch (apiError) {
        console.error("Failed to update API:", apiError)
      }
    } catch (error) {
      console.error("Something went wrong:", error)
      toast.error("Something went wrong")
    }
  }

  const removeFromWishlist = async (productId: string) => {
    console.log("Removing from wishlist:", productId)

    try {
      // Update local state first for better UX
      setWishlistItems((prev) => {
        console.log("Previous wishlist items:", prev)
        const newItems = prev.filter((id) => id !== productId)
        console.log("New wishlist items:", newItems)
        return newItems
      })
      toast.success("Removed from wishlist")

      // Then update API
      try {
        console.log("Sending API request to remove from wishlist")
        const response = await fetch(`/api/wishlist?productId=${productId}&userId=guest`, {
          method: "DELETE",
        })

        if (!response.ok) {
          console.error("API error when removing from wishlist")
        } else {
          console.log("API response:", await response.json())
        }
      } catch (apiError) {
        console.error("Failed to update API:", apiError)
      }
    } catch (error) {
      console.error("Something went wrong:", error)
      toast.error("Something went wrong")
    }
  }

  const isInWishlist = (productId: string) => {
    const result = wishlistItems.includes(productId)
    console.log("Checking if in wishlist:", productId, result)
    return result
  }

  const contextValue = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlistItems.length,
  }

  console.log("WishlistContext value:", contextValue)

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    console.error("useWishlist must be used within a WishlistProvider")
    return defaultContextValue
  }
  return context
}
