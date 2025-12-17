"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Package, Star, Tag, Calendar, Palette, Ruler, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/app/hooks/use-toast"
import type { IBestSellerProduct } from "@/app/lib/models/bestseller"

export default function BestSellerViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<IBestSellerProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/bestseller/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch product")
        }
        const data = await res.json()
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        })
        router.push("/dashboard/bestseller")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          <Link href="/dashboard/bestseller">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/bestseller">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{product.title}</h1>
            <p className="text-gray-600">Best Seller Product Details</p>
          </div>
        </div>
        <Link href={`/dashboard/bestseller/${product._id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-gray-900 font-semibold">{product.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1">
                  <Badge variant="secondary">{product.category}</Badge>
                </p>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <p className="mt-1 text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">MRP</label>
                <p className="mt-1 text-lg text-gray-500 line-through">₹{product.mrp.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Discount</label>
                <p className="mt-1">
                  <Badge variant="destructive">{product.discount}</Badge>
                </p>
              </div>
            </div>

            <Separator />

            {/* Ratings */}
            <div>
              <label className="text-sm font-medium text-gray-700">Ratings</label>
              <div className="mt-1 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-lg font-semibold">{product.ratings}</span>
                <span className="ml-1 text-gray-500">/ 5</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-gray-900 leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            {/* Slug */}
            <div>
              <label className="text-sm font-medium text-gray-700">URL Slug</label>
              <p className="mt-1 text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{product.slug}</p>
            </div>
          </CardContent>
        </Card>

        {/* Product Variations */}
        {product.variations && product.variations.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Box className="h-5 w-5 mr-2" />
                Product Variations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.variations.map((variation, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variation {index + 1}</h4>
                      <Badge variant={variation.stock > 0 ? "default" : "destructive"}>
                        {variation.stock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Palette className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Color: {variation.color}</span>
                      </div>
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Size: {variation.size}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Stock: {variation.stock}</span>
                      </div>
                      {variation.sku && (
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm font-mono">SKU: {variation.sku}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-gray-900">
                  {product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-gray-900">
                  {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
