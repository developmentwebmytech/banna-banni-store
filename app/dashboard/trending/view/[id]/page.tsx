"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Package, Star, Tag, Calendar, Palette, Ruler, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/app/hooks/use-toast"
import type { ITrendingProduct } from "@/app/lib/models/trending"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TrendingViewPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<ITrendingProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [id, setId] = useState<string>("")

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/trending/${id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch trending product")
      }
      const data = await res.json()
      setProduct(data)
    } catch (error) {
      console.error("Error fetching trending product:", error)
      toast({
        title: "Error",
        description: "Failed to load trending product details",
        variant: "destructive",
      })
      router.push("/dashboard/trending")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trending product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Product Not Found</h2>
          <p className="text-gray-600 mb-4">The trending product you're looking for doesn't exist.</p>
          <Link href="/dashboard/trending">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trending Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/trending">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Trending Product Details</h1>
        </div>
        <Link href={`/dashboard/trending/${id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image || "/placeholder.svg?height=200&width=200"}
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
              <p className="text-gray-600 mt-1">{product.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Category:</span>
              <Badge variant="secondary">{product.category}</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Rating:</span>
              <span className="font-medium">{product.ratings}/5</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MRP:</span>
                <span className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <Badge variant="destructive">{product.discount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Variations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Product Variations ({product.variations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {product.variations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No variations available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.variations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Color:</span>
                    <Badge variant="outline">{variation.color}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Size:</span>
                    <Badge variant="outline">{variation.size}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`font-medium ${variation.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {variation.stock}
                    </span>
                  </div>
                  {variation.sku && (
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">SKU:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{variation.sku}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Product ID:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{product._id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Slug:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{product.slug}</code>
          </div>
          {product.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm">{new Date(product.createdAt).toLocaleString()}</span>
            </div>
          )}
          {product.updatedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated:</span>
              <span className="text-sm">{new Date(product.updatedAt).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
