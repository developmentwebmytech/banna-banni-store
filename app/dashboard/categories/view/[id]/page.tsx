"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, Tag, Layers, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/app/hooks/use-toast"

interface ICategoryView {
  _id: string
  name: string
  images?: Array<{
    url: string
    categoryName: string
  }>
  description?: string
  parent_category_id: string | null
  createdAt: string
  updatedAt: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CategoryViewPage({ params }: PageProps) {
  const { toast } = useToast()
  const [id, setId] = useState<string>("")
  const [category, setCategory] = useState<ICategoryView | null>(null)
  const [parentCategory, setParentCategory] = useState<ICategoryView | null>(null)
  const [childCategories, setChildCategories] = useState<ICategoryView[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchCategoryData = async () => {
      setIsLoading(true)
      try {
        // Fetch the specific category
        const categoryRes = await fetch(`/api/categories/${id}`)
        if (!categoryRes.ok) {
          throw new Error("Failed to fetch category")
        }
        const categoryData = await categoryRes.json()
        setCategory(categoryData)

        // Fetch all categories to find parent and children
        const allRes = await fetch("/api/categories")
        const allCategories = await allRes.json()

        // Find parent category
        if (categoryData.parent_category_id) {
          const parent = allCategories.find((cat: ICategoryView) => cat._id === categoryData.parent_category_id)
          setParentCategory(parent || null)
        }

        // Find child categories
        const children = allCategories.filter((cat: ICategoryView) => cat.parent_category_id === categoryData._id)
        setChildCategories(children)
      } catch (err) {
        console.error("Fetch error:", err)
        toast({
          title: "Error",
          description: "Failed to load category details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryData()
  }, [id, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading || !id) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading category details...</p>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="space-y-6 px-10 py-16">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Category Not Found</h1>
        </div>
        <p className="text-gray-500">The requested category could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-blue-600 hover:text-white bg-transparent">
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Category Details</h1>
        </div>
        <Button asChild className="bg-teal-600 text-white">
          <Link href={`/dashboard/categories/${category._id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Category
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Category Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Category Name</label>
              <p className="text-lg font-semibold">{category.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Category ID</label>
              <p className="text-sm text-gray-600 font-mono">{category._id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-sm text-gray-700">{category.description || "No description provided"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Parent Category</label>
              {parentCategory ? (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{parentCategory.name}</Badge>
                  <Link
                    href={`/dashboard/categories/view/${parentCategory._id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Parent
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">No parent (Top-level category)</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="text-sm">{formatDate(category.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm">{formatDate(category.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        {category.images && category.images.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images ({category.images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg?height=128&width=128&query=category image"}
                      alt={image.categoryName}
                      className="w-full h-32 object-cover rounded-lg border shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate" title={image.url?.split("/").pop() || "Unknown"}>
                        {image.url?.split("/").pop() || "Unknown filename"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Child Categories */}
        {childCategories.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Sub-Categories ({childCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {childCategories.map((child) => (
                  <div key={child._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{child.name}</span>
                    <Link
                      href={`/dashboard/categories/view/${child._id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
