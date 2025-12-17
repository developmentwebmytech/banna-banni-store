"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Package, Star, Tag, IndianRupee, Calendar, Hash, Palette, Ruler, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/app/hooks/use-toast"

interface ProductVariation {
  color: string
  size: string
  stock: number
  sku?: string
}

interface ShopByCategoryProductData {
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

export default function ShopByCategoryViewPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<ShopByCategoryProductData | null>(null)
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
      const response = await fetch(`/api/admin/shopbycategory/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch category product")
      }

      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error("Error fetching category product:", error)
      toast({
        title: "Error",
        description: "Failed to load category product details",
        variant: "destructive",
      })
      router.push("/dashboard/shopbycategory")
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
      <div className="space-y-6 p-8">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/shopbycategory">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/shopbycategory">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Category Product Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-teal-600 hover:text-white bg-transparent">
            <Link href="/dashboard/shopbycategory">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{product.title}</h1>
            <p className="text-gray-600">Category Product Details</p>
          </div>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
          <Link href={`/dashboard/shopbycategory/${product._id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          {/* Product Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Product Variations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.variations && product.variations.length > 0 ? (
                <div className="space-y-4">
                  {product.variations.map((variation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Color</p>
                            <p className="font-medium">{variation.color}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="font-medium">{variation.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Stock</p>
                            <Badge variant={variation.stock > 0 ? "default" : "destructive"}>
                              {variation.stock} units
                            </Badge>
                          </div>
                        </div>
                        {variation.sku && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">SKU</p>
                              <p className="font-medium font-mono text-sm">{variation.sku}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No variations available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Pricing</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.mrp)}</span>
                      <Badge variant="destructive">{product.discount} OFF</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Ratings</p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{product.ratings}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-500 mb-1">Slug</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.slug}</code>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Record Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(product.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
