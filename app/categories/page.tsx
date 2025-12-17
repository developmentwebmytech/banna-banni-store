"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { RefreshCw, ArrowRight } from "lucide-react"
import Link from "next/link"

interface IHeaderCategory {
  _id: string
  name: string
  slug?: string
  title?: string
  description?: string
  images?: string   // 👈 string not array
  isActive?: boolean
}

export default function HeaderCategoryPage() {
  const [categories, setCategories] = useState<IHeaderCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeaderCategory = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log("[v0] Fetching categories from API")
        const res = await fetch(`/api/categories`)

        if (!res.ok) {
          throw new Error(`Failed to fetch header category: ${res.status}`)
        }

        const data = await res.json()
        console.log("[v0] Categories API response:", data)
        const categoryList = Array.isArray(data) ? data : data.categories || []
        setCategories(categoryList)
      } catch (error) {
        console.error("Failed to fetch header category:", error)
        setError("Failed to load category")
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeaderCategory()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-4 text-gray-500">Loading category...</p>
        </div>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.044-5.709-2.709M15 3.935c.915.15 1.76.486 2.527.965M9 3.935A9.678 9.678 0 0112 3c1.036 0 2.024.174 2.935.465"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Categories Found</h1>
          <p className="text-gray-500 text-center max-w-md">
            {error
              ? "Unable to load categories. Please try again later."
              : "No categories are available at the moment."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      {/* Header Section */}
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-3xl font-bold text-black mb-2">All Collection</h1>
        <p className="text-gray-600 max-w-4xl mx-auto text-md leading-relaxed">
          Grace meets comfort in this beautifully designed simple lehenga. Crafted from lightweight fabric, it features
          a flowy silhouette that's perfect for festive occasions, family gatherings, or casual celebrations.
        </p>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug || category._id}`}
                className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors"
              >
                <div className="group cursor-pointer">
                  <div className="bg-white rounded-md shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    {category.images ? (
                      <div className="relative h-80 overflow-hidden">
                        <Image
                          src={category.images || "/placeholder.svg"} // 👈 direct string
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={index < 6}
                          onError={() =>
                            console.log(`[v0] Image failed for category: ${category.name}`, category.images)
                          }
                        />
                      </div>
                    ) : (
                      <div className="relative h-80 overflow-hidden bg-gray-100 flex items-center justify-center">
                        <p className="text-sm text-gray-400">No Image</p>
                      </div>
                    )}

                    {/* Category Name */}
                    <div className="py-4 px-6">
                      <div className="flex items-center justify-between">
                        {category.name}
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">This category doesn't have any products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
