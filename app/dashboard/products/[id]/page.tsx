"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Save, PlusCircle, MinusCircle, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/app/hooks/use-toast"
import Link from "next/link"

// Define interfaces for product data
interface ProductVariation {
  size: string
  color: string
  stock: number
  price_modifier?: number
}

interface CategoryData {
  _id: string
  name: string
  description?: string
  image?: string
  slug: string
}

interface BrandData {
  _id: string
  name: string
  description?: string
  logo?: string
  slug: string
}

interface ProductData {
  _id?: string
  name: string
  description: string
  price: number
  oldPrice?: number
  discount?: string
  rating?: number
  purchased_price?: number
  transport_cost?: number
  gst?: string
  discount_price?: number
  discount_reason?: string
  total_price?: number
  other_cost?: number
  fpp?: number
  profit_margin?: number // percentage (e.g., 20 for 20%)
  sales_price?: number
  net_sales_price?: number
  status?: "draft" | "live" | "offline"
  images: string[]
  category_id: string
  brand_id: string
  variations: ProductVariation[]
  slug: string
  relatedProducts?: string[]
  bestseller?: boolean
  trending?: boolean
  newarrival?: boolean
  createdAt?: string
  updatedAt?: string
  instagram_url?: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

// Utility function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Utility function to get image URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/placeholder.svg?height=200&width=200&text=No+Image"
  if (imagePath.startsWith("http")) return imagePath
  if (imagePath.startsWith("data:")) return imagePath // Handle base64 images
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`
}

const roundTotalPrice = (price: number): number => {
  if (!price) return 0

  // If the decimal part is exactly .00, just return the integer part
  if (price % 1 === 0) {
    return Math.floor(price)
  }

  // If there's any decimal part above .00, round up to next integer
  return Math.ceil(price)
}

export default function ProductEditPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [id, setId] = useState<string>("")
  const [isNew, setIsNew] = useState(false)
  const [showCustomDiscountInput, setShowCustomDiscountInput] = useState(false)
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    price: 0,
    oldPrice: undefined,
    discount: undefined,
    rating: undefined,
    purchased_price: undefined,
    transport_cost: undefined,
    gst: "0%",
    discount_price: undefined,
    discount_reason: undefined,
    total_price: undefined,
    other_cost: undefined,
    fpp: undefined,
    profit_margin: undefined,
    sales_price: undefined,
    net_sales_price: undefined,
    status: "draft",
    images: [],
    category_id: "",
    brand_id: "",
    variations: [{ size: "", color: "", stock: 0 }],
    slug: "",
    relatedProducts: [],
    bestseller: false,
    trending: false,
    newarrival: false,
    instagram_url: "",
  })

  const [allCategories, setAllCategories] = useState<CategoryData[]>([])
  const [allBrands, setBrands] = useState<BrandData[]>([])
  const [allProducts, setAllProducts] = useState<ProductData[]>([])
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const productId = resolvedParams.id
      setId(productId)
      setIsNew(productId === "new")
    }
    getParams()
  }, [params])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch categories, brands, and all products
        const [categoriesRes, brandsRes, productsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
          fetch("/api/admin/products"),
        ])

        if (!categoriesRes.ok || !brandsRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch categories, brands, or products")
        }

        const categoriesData = await categoriesRes.json()
        const brandsData = await brandsRes.json()
        const productsData = await productsRes.json()

        // Convert to our interfaces
        const typedCategories: CategoryData[] = (categoriesData || []).map((cat: any) => ({
          _id: String(cat._id || cat.id || ""),
          name: cat.name || "",
          description: cat.description,
          image: cat.image,
          slug: cat.slug || "",
        }))

        const typedBrands: BrandData[] = (brandsData.brands || []).map((brand: any) => ({
          _id: String(brand._id || brand.id || ""),
          name: brand.name || "",
          description: brand.description,
          logo: brand.logo,
          slug: brand.slug || "",
        }))

        const typedProducts: ProductData[] = (productsData.products || []).map((product: any) => ({
          _id: String(product._id || ""),
          name: product.name || "",
          description: product.description || "",
          price: Number(product.price) || 0,
          images: product.images || [],
          category_id:
            typeof product.category_id === "object" && product.category_id?._id
              ? String(product.category_id._id)
              : String(product.category_id || ""),
          brand_id:
            typeof product.brand_id === "object" && product.brand_id?._id
              ? String(product.brand_id._id)
              : String(product.brand_id || ""),
          variations: product.variations || [],
          slug: product.slug || "",
          relatedProducts: product.relatedProducts || [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          purchased_price: product.purchased_price,
          transport_cost: product.transport_cost,
          gst: product.gst || "0%",
          discount_price: product.discount_price,
          discount_reason: product.discount_reason,
          total_price: product.total_price,
        }))

        setAllCategories(typedCategories)
        setBrands(typedBrands)
        setAllProducts(typedProducts)

        if (!isNew && id) {
          // Fetch product by ID from admin API
          const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" })
          if (!res.ok) {
            throw new Error("Failed to load product")
          }
          const data = await res.json()

          const typedProduct: ProductData = {
            name: data.name || "",
            description: data.description || "",
            price: data.price ?? 0,
            oldPrice: data.oldPrice,
            discount: data.discount,
            rating: data.rating,
            purchased_price: data.purchased_price,
            transport_cost: data.transport_cost,
            gst: data.gst || "0%",
            discount_price: data.discount_price,
            discount_reason: data.discount_reason,
            total_price: data.total_price,
            status: data.status || "draft",
            images: data.images || [],
            category_id: data.category_id || "",
            brand_id: data.brand_id || "",
            variations:
              data.variations && data.variations.length > 0 ? data.variations : [{ size: "", color: "", stock: 0 }],
            slug: data.slug || "",
            relatedProducts: Array.isArray(data.relatedProducts)
              ? data.relatedProducts.map((p: any) => p._id ?? p)
              : [],
            bestseller: data.bestseller || false,
            trending: data.trending || false,
            newarrival: data.newarrival || false,
            instagram_url: data.instagram_url || "",
          }

          setProductData(typedProduct)
          setImagePreviews(typedProduct.images || [])
          setSelectedRelatedProducts(typedProduct.relatedProducts || [])

          const predefinedReasons = ["seasonal sale", "bulk discount"]
          if (typedProduct.discount_reason && !predefinedReasons.includes(typedProduct.discount_reason.toLowerCase())) {
            setShowCustomDiscountInput(true)
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load")
        setIsLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, isNew])

  const recalcPricing = (data: ProductData): ProductData => {
    // Step 1: Landed Cost (excl. GST)
    const purchasePrice = data.purchased_price || 0
    const transportCost = data.transport_cost || 0
    const otherCost = data.other_cost || 0
    const landedCost = purchasePrice + transportCost + otherCost

    // Step 2: Add Profit
    const profitPercent = data.profit_margin || 0
    const profitAmount = landedCost * (profitPercent / 100)
    const sellingPriceBeforeGST = landedCost + profitAmount

    // Step 3: Apply Discount
    const discountAmount = data.discount_price || 0
    const taxableValue = sellingPriceBeforeGST - discountAmount

    const discountPercentage =
      sellingPriceBeforeGST > 0 ? ((discountAmount / sellingPriceBeforeGST) * 100).toFixed(1) : "0"
    const discountLabel = discountAmount > 0 ? `${discountPercentage}% OFF` : ""

    // Step 4: Apply GST
    const gstPercent = Number.parseFloat((data.gst || "0%").replace("%", ""))
    const gstAmount = taxableValue * (gstPercent / 100)
    const finalInvoiceValue = taxableValue + gstAmount

    return {
      ...data,
      fpp: landedCost,
      sales_price: sellingPriceBeforeGST,
      net_sales_price: taxableValue,
      total_price: finalInvoiceValue,
      discount: discountLabel, // Auto-calculated discount label
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setProductData((prev) => {
      const numericFields = new Set([
        "price",
        "oldPrice",
        "rating",
        "purchased_price",
        "transport_cost",
        "other_cost", // Added other_cost to numeric fields
        "discount_price",
        "profit_margin",
      ])

      let parsed: any = value
      if (numericFields.has(name)) {
        parsed = value === "" ? undefined : Number.parseFloat(value)
      }

      let newData: ProductData = { ...prev, [name]: parsed }

      const pricingFields = new Set([
        "purchased_price",
        "transport_cost",
        "other_cost",
        "profit_margin",
        "discount_price",
        "gst",
      ])

      if (pricingFields.has(name)) {
        newData = recalcPricing(newData)
      }

      return newData
    })
  }

  const handleDiscountReasonChange = (value: string) => {
    if (value === "other") {
      setShowCustomDiscountInput(true)
      setProductData((prev) => ({ ...prev, discount_reason: "" }))
    } else {
      setShowCustomDiscountInput(false)
      setProductData((prev) => ({ ...prev, discount_reason: value }))
    }
  }

  const handleSelectChange = (name: keyof ProductData, value: string) => {
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)

      try {
        // Convert files to base64 for storage
        const base64Images = await Promise.all(files.map((file) => fileToBase64(file)))

        setImagePreviews((prev) => [...prev, ...base64Images])
        setProductData((prev) => ({
          ...prev,
          images: [...prev.images, ...base64Images],
        }))

        toast({
          title: "Images added",
          description: `${files.length} image(s) have been added to the product.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process images. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleVariationChange = (index: number, field: keyof ProductVariation, value: string | number) => {
    const newVariations = [...productData.variations]
    newVariations[index] = {
      ...newVariations[index],
      [field]:
        typeof value === "string" && field !== "size" && field !== "color"
          ? value === ""
            ? field === "price_modifier"
              ? undefined
              : 0
            : Number.parseFloat(value)
          : value,
    }
    setProductData((prev) => ({ ...prev, variations: newVariations }))
  }

  const addVariation = () => {
    setProductData((prev) => ({
      ...prev,
      variations: [...prev.variations, { size: "", color: "", stock: 0 }],
    }))
  }

  const removeVariation = (index: number) => {
    if (productData.variations.length > 1) {
      setProductData((prev) => ({
        ...prev,
        variations: prev.variations.filter((_, i) => i !== index),
      }))
    }
  }

  const handleRelatedProductChange = (productId: string, checked: boolean) => {
    setSelectedRelatedProducts((prev) => {
      if (checked) {
        return [...prev, productId]
      } else {
        return prev.filter((id) => id !== productId)
      }
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading and trailing hyphens
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)

    try {
      if (!productData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Product name is required",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const { fpp, profit_margin, sales_price, net_sales_price, ...rest } = productData

      const dataToSubmit = {
        ...rest,
        instagram_url: rest.instagram_url || undefined,
        slug: isNew ? generateSlug(productData.name) : productData.slug,
        price: rest.price || 0,
        category_id: rest.category_id || null,
        brand_id: rest.brand_id || null,
        images: rest.images.length > 0 ? rest.images : [],
        variations:
          rest.variations.filter((v) => v.size || v.color || v.stock > 0).length > 0
            ? rest.variations
            : [{ size: "", color: "", stock: 0 }],
        relatedProducts: selectedRelatedProducts,
        bestseller: rest.bestseller || false,
        trending: rest.trending || false,
        newarrival: rest.newarrival || false,
      }

      const apiUrl = isNew ? "/api/admin/products" : `/api/admin/products/${id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${isNew ? "create" : "update"} product`)
      }

      toast({
        title: "Success",
        description: isNew ? "Product created successfully" : "Product updated successfully",
      })

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  if (isLoading || !id) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading product data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span>{productData.name || "Untitled Product"}</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
        </div>
      </div>

      {!isNew && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${id}/3pc-lehengas/new`)}
              disabled={isSaving}
            >
              Add 3pc Lehenga
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${id}/blouses/new`)}
              disabled={isSaving}
            >
              Add Blouses
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${id}/one-pc-kurtis/new`)}
              disabled={isSaving}
            >
              Add 1pc Kurti
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${id}/two-pc-kurtis/new`)}
              disabled={isSaving}
            >
              Add 2pc Kurti
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${id}/three-pc-kurtis/new`)}
              disabled={isSaving}
            >
              Add 3pc Kurti
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/products/${id}/petticoat-kurtis/new`)}
              disabled={isSaving}
            >
              Add Petticoat
            </Button>
          </div>
        </div>
      )}

      <div className="p-6">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Name, Description, Media Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Product Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSaving}
                      placeholder="Short sleeve t-shirt"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {!productData.name.trim() && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm"></div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <div className="mt-1 border border-gray-300 rounded-md">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <Select defaultValue="paragraph">
                          <SelectTrigger className="w-24 h-8 border-0 bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paragraph">Paragraph</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="font-bold">B</span>
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="italic">I</span>
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="underline">U</span>
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="description"
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        rows={6}
                        disabled={isSaving}
                        placeholder="Enter detailed product description"
                        className="border-0 resize-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Media</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="text-center">
                        <div className="flex justify-center gap-4 mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("product-image-upload")?.click()}
                            disabled={isSaving}
                          >
                            Upload new
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">Accepts images, videos, or 3D models</p>
                        <input
                          id="product-image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        {imagePreviews.map((src, index) => (
                          <div key={index} className="relative group aspect-square">
                            <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
                              <Image
                                src={getImageUrl(src) || "/placeholder.svg"}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=200&width=200&text=Error"
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                              disabled={isSaving}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Pricing</h3>

                {/* Step 1: Landed Cost */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Step 1: Landed Cost (excl. GST)</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="purchased_price" className="text-sm font-medium text-gray-700">
                        Purchase Price
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="purchased_price"
                          name="purchased_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={productData.purchased_price || ""}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          placeholder="100"
                          className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="transport_cost" className="text-sm font-medium text-gray-700">
                        Transport Cost
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="transport_cost"
                          name="transport_cost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={productData.transport_cost || ""}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          placeholder="15"
                          className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="other_cost" className="text-sm font-medium text-gray-700">
                        Other Cost
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="other_cost"
                          name="other_cost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={productData.other_cost || ""}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          placeholder="5"
                          className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fpp" className="text-sm font-medium text-gray-700">
                        Total Cost
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="fpp"
                          name="fpp"
                          type="number"
                          step="0.01"
                          value={productData.fpp || 0}
                          disabled
                          placeholder="120"
                          className="pl-8 border-gray-300 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 my-6" />

                {/* Step 2: Add Profit */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Step 2: Add Profit</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profit_margin" className="text-sm font-medium text-gray-700">
                        Profit in %
                      </Label>
                      <div className="mt-1 relative">
                        <Input
                          id="profit_margin"
                          name="profit_margin"
                          type="number"
                          step="0.01"
                          min="0"
                          value={productData.profit_margin || ""}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          placeholder="20"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sales_price" className="text-sm font-medium text-gray-700">
                        Selling Price Before GST (no discount yet)
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="sales_price"
                          name="sales_price"
                          type="number"
                          step="0.01"
                          value={productData.sales_price || 0}
                          disabled
                          placeholder="144"
                          className="pl-8 border-gray-300 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 my-6" />

                {/* Step 3: Apply Discount */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Step 3: Apply Discount</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="discount_price" className="text-sm font-medium text-gray-700">
                        Discount
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="discount_price"
                          name="discount_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={productData.discount_price || ""}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          placeholder="7"
                          className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="net_sales_price" className="text-sm font-medium text-gray-700">
                        Taxable Value (after discount, before GST)
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="net_sales_price"
                          name="net_sales_price"
                          type="number"
                          step="0.01"
                          value={productData.net_sales_price || 0}
                          disabled
                          placeholder="137"
                          className="pl-8 border-gray-300 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
                        Discount Label
                      </Label>
                      <Input
                        id="discount"
                        name="discount"
                        value={productData.discount || ""}
                        disabled
                        placeholder="Auto-calculated (e.g., 5% OFF)"
                        className="mt-1 border-gray-300 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_reason" className="text-sm font-medium text-gray-700">
                        Discount Reason
                      </Label>
                      <div className="space-y-2">
                        <Select
                          value={showCustomDiscountInput ? "other" : productData.discount_reason || ""}
                          onValueChange={handleDiscountReasonChange}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select discount reason" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="seasonal sale">Seasonal Sale</SelectItem>
                            <SelectItem value="bulk discount">Bulk Discount</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        {showCustomDiscountInput && (
                          <Input
                            id="custom_discount_reason"
                            name="discount_reason"
                            value={productData.discount_reason || ""}
                            onChange={handleInputChange}
                            placeholder="Discount reason / Discount description"
                            disabled={isSaving}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 my-6" />

                {/* Step 4: Apply GST */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Step 4: Apply GST</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gst" className="text-sm font-medium text-gray-700">
                        GST
                      </Label>
                      <div className="mt-1 relative">
                        <Input
                          id="gst"
                          name="gst"
                          type="text"
                          value={productData.gst || ""}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          placeholder="10%"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="total_price" className="text-sm font-medium text-gray-700">
                        Final Invoice Value
                      </Label>
                      <div className="mt-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="total_price"
                          name="total_price"
                          type="number"
                          step="0.01"
                          value={roundTotalPrice(productData.total_price || 0)}
                          disabled
                          placeholder="150.70"
                          className="pl-8 border-gray-300 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 my-6" />

                <hr className="border-gray-200 my-6" />

                {/* Summary Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">✅ Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Landed cost =</span>
                      <span>₹{productData.fpp || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit added =</span>
                      <span>₹{((productData.fpp || 0) * ((productData.profit_margin || 0) / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross selling price =</span>
                      <span>₹{productData.sales_price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount =</span>
                      <span>₹{productData.discount_price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable value =</span>
                      <span>₹{productData.net_sales_price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST @{productData.gst || "0%"} =</span>
                      <span>
                        ₹
                        {(
                          (productData.net_sales_price || 0) *
                          (Number.parseFloat((productData.gst || "0%").replace("%", "")) / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Final price customer pays =</span>
                      <span>₹{roundTotalPrice(productData.total_price || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variations Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Variants</h3>
                  <Button type="button" variant="outline" onClick={addVariation} disabled={isSaving} size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Variation
                  </Button>
                </div>

                <div className="space-y-4">
                  {productData.variations.map((variation, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`size-${index}`}>Size</Label>
                        <Input
                          id={`size-${index}`}
                          value={variation.size}
                          onChange={(e) => handleVariationChange(index, "size", e.target.value)}
                          placeholder="S, M, L, XL"
                          disabled={isSaving}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`color-${index}`}>Color</Label>
                        <Input
                          id={`color-${index}`}
                          value={variation.color}
                          onChange={(e) => handleVariationChange(index, "color", e.target.value)}
                          placeholder="Red, Blue, Black"
                          disabled={isSaving}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`stock-${index}`}>Stock</Label>
                        <Input
                          id={`stock-${index}`}
                          type="number"
                          min="0"
                          value={variation.stock}
                          onChange={(e) => handleVariationChange(index, "stock", e.target.value)}
                          disabled={isSaving}
                          placeholder="0"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`price_modifier-${index}`}>Price Modifier (₹)</Label>
                        <Input
                          id={`price_modifier-${index}`}
                          type="number"
                          step="0.01"
                          value={variation.price_modifier || ""}
                          onChange={(e) => handleVariationChange(index, "price_modifier", e.target.value)}
                          placeholder="0.00"
                          disabled={isSaving}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeVariation(index)}
                          disabled={isSaving || productData.variations.length === 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Add different size and color combinations for your product. Price modifier will be added to the base
                  price.
                </p>
              </div>

              {/* Related Products Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Related Products</h3>
                <div className="max-h-60 overflow-y-auto">
                  {allProducts
                    .filter((product) => product._id !== id)
                    .slice(0, 5)
                    .map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <Checkbox
                          checked={selectedRelatedProducts.includes(product._id!)}
                          onCheckedChange={(checked) => handleRelatedProductChange(product._id!, checked as boolean)}
                          disabled={isSaving}
                        />
                        <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden">
                          <Image
                            src={getImageUrl(product.images[0] || "")}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            ₹{(product.total_price || product.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Status</h3>
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Product Status
                  </Label>
                  <Select
                    value={productData.status || "draft"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select product status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only "Live" products will be visible on the frontend. Draft and Offline products are only visible in
                    the admin dashboard.
                  </p>
                </div>
              </div>

              {/* Category and Brand Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div>
                  <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                    Category
                  </Label>
                  <Select
                    value={productData.category_id}
                    onValueChange={(value) => handleSelectChange("category_id", value)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Choose a product category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {allCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Determines tax rates and adds metafields to improve search, filters, and cross-channel sales
                  </p>
                </div>

                <div className="mt-4">
                  <Label htmlFor="brand_id" className="text-sm font-medium text-gray-700">
                    Brand
                  </Label>
                  <Select
                    value={productData.brand_id}
                    onValueChange={(value) => handleSelectChange("brand_id", value)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {allBrands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Categories Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Product Categories</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bestseller"
                      checked={productData.bestseller || false}
                      onCheckedChange={(checked) =>
                        setProductData((prev) => ({
                          ...prev,
                          bestseller: checked as boolean,
                        }))
                      }
                      disabled={isSaving}
                    />
                    <Label htmlFor="bestseller" className="text-sm font-medium text-gray-700">
                      Bestseller
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trending"
                      checked={productData.trending || false}
                      onCheckedChange={(checked) =>
                        setProductData((prev) => ({
                          ...prev,
                          trending: checked as boolean,
                        }))
                      }
                      disabled={isSaving}
                    />
                    <Label htmlFor="trending" className="text-sm font-medium text-gray-700">
                      Trending
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newarrival"
                      checked={productData.newarrival || false}
                      onCheckedChange={(checked) =>
                        setProductData((prev) => ({
                          ...prev,
                          newarrival: checked as boolean,
                        }))
                      }
                      disabled={isSaving}
                    />
                    <Label htmlFor="newarrival" className="text-sm font-medium text-gray-700">
                      New Arrival
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Select which categories this product belongs to. You can select multiple categories.
                </p>
              </div>

              {/* Link to Instagram Box */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
                <Label htmlFor="instagram_url" className="text-sm font-medium text-gray-700">
                  Link to Instagram (Product Video)
                </Label>
                <Input
                  id="instagram_url"
                  name="instagram_url"
                  type="url"
                  placeholder="https://www.instagram.com/reel/..."
                  value={productData.instagram_url || ""}
                  onChange={(e) => {
                    // reuse existing handler to keep logic centralized
                    handleInputChange(e)
                  }}
                  disabled={isSaving}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Videos cannot be uploaded here. Each product's video will be on Instagram — please put its link here.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
                <Label htmlFor="rating" className="text-sm font-medium text-gray-700">
                  Rating
                </Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={productData.rating || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  placeholder="4.5"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a rating between 0 and 5 stars for this product.</p>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-teal-800 hover:bg-teal-800 text-white px-6 py-2 rounded-lg shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
