import mongoose from "mongoose"

export interface ICartItem {
  _id?: string
  userId: string
  productId: string
  quantity: number
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
    stock?: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface ICart {
  _id?: string
  userId: string
  items: ICartItem[]
  totalAmount: number
  totalItems: number
  createdAt?: string
  updatedAt?: string
}

export interface CartContextType {
  cartItems: ICartItem[]
  addToCart: (product: any, quantity?: number) => Promise<void>
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

const CartItemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, default: "guest" },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    product: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      total_price: { type: Number }, // Ensure total_price is included in schema
      oldPrice: { type: Number },
      discount: { type: String },
      images: [{ type: String }],
      slug: { type: String },
      rating: { type: Number },
      stock: { type: Number },
    },
  },
  {
    timestamps: true,
  },
)

export const CartItem = mongoose.models.CartItem || mongoose.model("CartItem", CartItemSchema)
