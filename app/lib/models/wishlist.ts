export interface IWishlistItem {
  _id?: string
  userId: string
  productId: string
  product?: {
    _id: string
    name: string
    price: number
      total_price?: number
    oldPrice?: number
    discount?: string
    images: string[]
    slug: string
    rating?: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface IWishlist {
  _id?: string
  userId: string
  items: IWishlistItem[]
  createdAt?: string
  updatedAt?: string
}
