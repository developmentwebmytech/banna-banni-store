"use client"

import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { INewArrivalProduct } from "@/app/lib/models/newarrival"

// Create a type for plain product data without Mongoose Document methods
type ProductData = {
  _id: string
  images: string[]
  discount: string
  title: string
  description: string
  price: number
  mrp: number
  ratings: number
  category: string
  slug: string
  variations: { color: string; size: string; stock: number }[]
  createdAt: Date
  updatedAt: Date
}

// Default products to display if API is empty or fails
const defaultProducts: ProductData[] = [
  {
    _id: "default1",
    images: ["/shopbycategory1.webp"],
    discount: "75%",
    title: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    description: "Beautiful pastal cream lehenga with intricate thread embroidery work",
    price: 4299,
    mrp: 11999,
    ratings: 4,
    category: "Lehenga",
    slug: "pastal-cream-lehenga-1",
    variations: [{ color: "Cream", size: "M", stock: 10 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default2",
    images: ["/shopbycategory2.webp"],
    discount: "64%",
    title: "Elegant Blue Silk Saree with Zari Work",
    description: "Elegant blue silk saree featuring beautiful zari work and traditional design",
    price: 5999,
    mrp: 16999,
    ratings: 5,
    category: "Saree",
    slug: "elegant-blue-silk-saree",
    variations: [{ color: "Blue", size: "Free", stock: 5 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default3",
    images: ["/shopbycategory3.webp"],
    discount: "35%",
    title: "Traditional Red Bridal Gown with Heavy Embellishments",
    description: "Stunning red bridal gown with heavy embellishments perfect for special occasions",
    price: 8999,
    mrp: 13999,
    ratings: 3.5,
    category: "Gown",
    slug: "traditional-red-bridal-gown",
    variations: [{ color: "Red", size: "L", stock: 3 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default4",
    images: ["/shopbycategory1.webp"],
    discount: "44%",
    title: "Modern Green Anarkali Suit with Dupatta",
    description: "Modern green anarkali suit with matching dupatta and contemporary design",
    price: 3499,
    mrp: 6299,
    ratings: 4.5,
    category: "Suit",
    slug: "modern-green-anarkali-suit",
    variations: [{ color: "Green", size: "S", stock: 12 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function NewArrival() {
  const [products, setProducts] = useState<(INewArrivalProduct | ProductData)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/newarrivals")
        if (!response.ok) {
          throw new Error("Failed to fetch new arrival products")
        }
        const data = await response.json()
        // If API returns no products, use default ones
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          setProducts(defaultProducts)
        }
      } catch (err: any) {
        setError(err.message)
        setProducts(defaultProducts) // Fallback to default on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="bg-white py-12 px-4 sm:px-8 lg:px-16 text-center">
        <p>Loading new arrivals...</p>
      </section>
    )
  }

  if (error && products.length === 0) {
    return (
      <section className="bg-white py-12 px-4 sm:px-8 lg:px-16 text-center text-red-500">
        <p>Error: {error}. Displaying default products.</p>
      </section>
    )
  }

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">New Arrival</h2>
      <p className="text-center text-gray-500 text-sm mt-2 mb-10">Hot Selling Designer Lehenga with Premium Quality</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={String(product._id)}
            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300 relative group"
          >
            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                -{product.discount} OFF
              </div>
            )}

            {/* Product Image with Hover Effect and Link */}
            <Link href={`/newarrival/${product.slug}`} className="block relative overflow-hidden">
              <Image
                src={product.images[0] || "/placeholder.svg?height=600&width=500"}
                alt={product.title}
                width={500}
                height={600}
                className="w-full h-[650px] object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Cart Icon Overlay */}
              <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="sr-only">Add to Cart</span>
                </Button>
              </div>
            </Link>

            {/* Product Info */}
            <div className="p-4">
              {/* Rating */}
              <div className="flex items-center mb-2 text-orange-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.ratings) ? "fill-current" : "text-orange-300"}`}
                  />
                ))}
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-medium text-gray-800 leading-snug line-clamp-2 mb-2">{product.title}</h3>

              {/* Price */}
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-gray-500">MRP: ₹{product.mrp.toLocaleString()}</span>
                <span className="text-[#d90429] font-semibold text-base">Rs. {product.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
