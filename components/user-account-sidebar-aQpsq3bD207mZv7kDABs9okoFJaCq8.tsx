"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { User, Package, ShoppingCart, MapPin, LogOut, Heart } from "lucide-react"

interface UserAccountSidebarProps {
  activeItem: "profile" | "orders"  | "wishlist" | "cart" | "address"
}

export default function UserAccountSidebar({ activeItem }: UserAccountSidebarProps) {
  const menuItems = [
    {
      name: "Profile",
      href: "/account/profile",
      icon: <User className="h-5 w-5" />,
      id: "profile",
    },
    {
      name: "Address",
      href: "/account/address",
      icon: <MapPin className="h-5 w-5" />,
      id: "address",
    },
    {
      name: "Orders",
      href: "/account/orders",
      icon: <Package className="h-5 w-5" />,
      id: "orders",
    },
     {
      name: "Wishlist",
      href: "/account/wishlist",
      icon: <Heart className="h-5 w-5" />,
      id: "wishlist",
    },
    {
      name: "Cart",
      href: "/account/cart",
      icon: <ShoppingCart className="h-5 w-5" />,
      id: "cart",
    },
  ]

  const handleLogout = async () => {
    try {
      // Call your custom logout API to clear cookie
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Also sign out NextAuth session
      await signOut({ callbackUrl: "/" })
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md">
      <div className="p-4 sm:p-6 border-b">
        <h2 className="text-lg sm:text-xl font-medium text-teal-700">My Account</h2>
      </div>
      <nav className="p-3 sm:p-4 md:p-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-md transition-colors duration-200 ${
                  activeItem === item.id
                    ? "bg-amber-50 text-teal-700"
                    : "text-teal-600 hover:bg-teal-600 hover:text-white"
                }`}
              >
                <span className="mr-2 sm:mr-3">{item.icon}</span>
                <span className="text-sm sm:text-base">{item.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-md text-teal-600 hover:bg-teal-600 hover:text-white transition-colors duration-200"
            >
              <span className="mr-2 sm:mr-3">
                <LogOut className="h-5 w-5" />
              </span>
              <span className="text-sm sm:text-base cursor-pointer">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
