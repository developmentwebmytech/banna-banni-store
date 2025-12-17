"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistState {
  wishlistItems: string[] // Array of product IDs
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      addToWishlist: (productId: string) => {
        const { wishlistItems } = get()
        if (!wishlistItems.includes(productId)) {
          set({ wishlistItems: [...wishlistItems, productId] })
        }
      },
      removeFromWishlist: (productId: string) => {
        const { wishlistItems } = get()
        set({ wishlistItems: wishlistItems.filter((id) => id !== productId) })
      },
      isInWishlist: (productId: string) => {
        const { wishlistItems } = get()
        return wishlistItems.includes(productId)
      },
      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
)
