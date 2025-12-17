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

interface ProductVariation {
  color: string
  size: string
  stock: number
  sku?: string
}

interface ProductData {
  _id: string
  images: string[]
  title: string
  description: string
  category: string
  price: number
  mrp: number
  discount: string
  ratings: number
  slug: string
  variations: ProductVariation[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewArrivalViewPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductData | null>(null)
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
    if (!id) return
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/newarrivals/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-gray-500 mb-4">Product not found</p>
        <Button asChild>
          <Link href="/dashboard/newarrivals">Back to New Arrivals</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/newarrivals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <p className="text-gray-500">New Arrival Product Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/newarrivals/${product._id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-square relative rounded overflow-hidden bg-gray-100">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.title} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{product.category}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Slug</label>
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4 text-gray-600" />
                  <span className="font-mono text-sm">{product.slug}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatPrice(product.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">MRP</label>
                <p className="text-xl font-semibold text-gray-500 line-through mt-1">{formatPrice(product.mrp)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Discount</label>
                <Badge variant="destructive" className="mt-1 text-sm">
                  {product.discount}
                </Badge>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-gray-500">Rating</label>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">{product.ratings}</span>
                <span className="text-gray-500">out of 5</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Product Variations */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Product Variations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.variations && product.variations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.variations.map((variation, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Color:</span>
                          <Badge variant="outline">{variation.color}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Size:</span>
                          <Badge variant="outline">{variation.size}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Stock:</span>
                          <Badge variant={variation.stock > 0 ? "default" : "destructive"}>
                            {variation.stock} units
                          </Badge>
                        </div>
                        {variation.sku && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">SKU:</span>
                            <span className="font-mono text-sm">{variation.sku}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No variations available for this product</p>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 font-medium">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 font-medium">{formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
