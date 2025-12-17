"use client"

import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "./context/CartContext"
import { getImageUrl } from "@/app/lib/utils"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, isLoading } = useCart()

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-opacity-50 z-40" onClick={onClose} />}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-[400px] max-w-full h-full bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-[22px] font-semibold">Shopping Cart {cartCount > 0 && `(${cartCount})`}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={26} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        )}

        {/* Cart Items */}
        {!isLoading && (
          <div className="overflow-y-auto h-[calc(100%-200px)] px-4 py-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm text-center mb-4">Add items to your cart to see them here</p>
                <Link
                  href="/products"
                  className="bg-teal-700 hover:bg-teal-800 text-white text-sm py-2 px-4 rounded font-semibold"
                  onClick={onClose}
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="rounded p-3 flex items-start gap-3 shadow-sm border">
                  <div className="relative w-[80px] h-[100px] flex-shrink-0">
                    <Image
                      src={getImageUrl(item.product?.images?.[0] || "")}
                      alt={item.product?.name || "Product"}
                      fill
                      sizes="80px"
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between w-full min-h-[100px]">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">{item.product?.name}</h3>
                      {item.product?.oldPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          MRP: ₹{item.product.oldPrice.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-red-600">
                        ₹{item.product?.total_price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="border rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          className="border rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={Boolean(item.product?.stock && item.quantity >= item.product.stock)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button className="text-gray-600 hover:text-red-600 p-1" onClick={() => removeFromCart(item._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="text-sm font-semibold text-gray-800 mt-1">
                      Total: ₹{((item.product?.total_price || 0) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Subtotal Section */}
        {!isLoading && cartItems.length > 0 && (
          <div className="px-4 pt-4 pb-3 border-t text-sm">
            <div className="flex justify-between font-semibold text-base mb-2">
              <span>Subtotal:</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              Shipping and taxes calculated at checkout. Free shipping on orders above ₹79.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href="/cart"
                className="w-1/2 bg-teal-700 hover:bg-teal-800 text-white text-sm py-2 rounded font-semibold text-center"
                onClick={onClose}
              >
                VIEW CART
              </Link>
              <Link
                href="/checkout"
                className="w-1/2 bg-teal-700 hover:bg-teal-800 text-white text-sm py-2 rounded font-semibold text-center"
                onClick={onClose}
              >
                CHECKOUT
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
