"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Trash, Upload, PlusCircle, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/app/hooks/use-toast"

// Define interfaces for shop by category product data
interface ProductVariation {
  color: string
  size: string
  stock: number
  sku?: string
}

interface ShopByCategoryProductData {
  _id?: string
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

export default function ShopByCategoryEditPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [id, setId] = useState<string>("")
  const [isNew, setIsNew] = useState(false)
  const [productData, setProductData] = useState<ShopByCategoryProductData>({
    images: [],
    title: "",
    description: "",
    category: "",
    price: 0,
    mrp: 0,
    discount: "",
    ratings: 0,
    slug: "",
    variations: [],
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
    if (!id) return // Wait for id to be set

    if (!isNew) {
      fetchProduct()
    } else {
      setIsLoading(false)
    }
  }, [id, isNew])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/shopbycategory/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }
      const data = await response.json()

      // Convert the response to our ShopByCategoryProductData interface
      setProductData({
        _id: data._id,
        images: data.images || [],
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        price: data.price || 0,
        mrp: data.mrp || 0,
        discount: data.discount || "",
        ratings: data.ratings || 0,
        slug: data.slug || "",
        variations: data.variations || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })

      setImagePreviews(data.images || [])
    } catch (err) {
      console.error("Fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "mrp" || name === "ratings" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...files])
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
      toast({
        title: "Images selected",
        description: "Don't forget to save to upload the images",
      })
    }
  }

  const handleRemoveImage = (indexToRemove: number, isExisting: boolean) => {
    if (isExisting) {
      // If it's an existing image, remove it from productData.images
      setProductData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== indexToRemove),
      }))
      setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove))
    } else {
      // If it's a newly selected image, remove it from imageFiles and imagePreviews
      const newFileIndex = indexToRemove - productData.images.length
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex))
      setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove))
    }
  }

  const handleAddVariation = () => {
    setProductData((prev) => ({
      ...prev,
      variations: [...prev.variations, { color: "", size: "", stock: 0 }],
    }))
  }

  const handleRemoveVariation = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }))
  }

  const handleVariationChange = (index: number, field: keyof ProductVariation, value: string | number) => {
    setProductData((prev) => {
      const newVariations = [...prev.variations]
      newVariations[index] = {
        ...newVariations[index],
        [field]: field === "stock" ? Number.parseInt(value as string) || 0 : value,
      }
      return { ...prev, variations: newVariations }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSaving) return

    setIsSaving(true)

    try {
      // Validation
      const requiredFields: (keyof ShopByCategoryProductData)[] = [
        "title",
        "description",
        "category",
        "price",
        "mrp",
        "discount",
        "ratings",
      ]

      for (const field of requiredFields) {
        if (!productData[field]) {
          toast({
            title: "Validation Error",
            description: `${field} is required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      if (productData.images.length === 0 && imageFiles.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one image is required",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Validate variations
      for (let i = 0; i < productData.variations.length; i++) {
        const variation = productData.variations[i]
        if (!variation.color || !variation.size || variation.stock < 0) {
          toast({
            title: "Validation Error",
            description: `Variation ${i + 1}: Color, size, and stock are required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      const uploadedImageUrls: string[] = [...productData.images] // Start with existing images

      // Upload new images
      for (const file of imageFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || "Failed to upload image")
        }

        const result = await uploadResponse.json()
        uploadedImageUrls.push(result.url)
      }

      const finalData = { ...productData, images: uploadedImageUrls }

      const apiUrl = isNew ? "/api/admin/shopbycategory" : `/api/admin/shopbycategory/${id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Save error response:", errorData)
        throw new Error(errorData.error || `Failed to ${isNew ? "create" : "update"} product`)
      }

      const savedProduct = await response.json()
      toast({
        title: "Success",
        description: isNew ? "Product created successfully" : "Product updated successfully",
      })

      router.push("/dashboard/shopbycategory")
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

  if (isLoading || !id) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-teal-600 hover:text-white bg-transparent">
            <Link href="/dashboard/shopbycategory">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create New Category Product" : "Edit Category Product"}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-lg bg-[#000000a3] text-white"
            onClick={() => router.push("/dashboard/shopbycategory")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="product-form" disabled={isSaving} className="text-lg bg-teal-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={productData.title}
            onChange={handleInputChange}
            required
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleInputChange}
            rows={4}
            required
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={productData.category}
              onChange={handleInputChange}
              required
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={productData.price}
              onChange={handleInputChange}
              required
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mrp">MRP (₹)</Label>
            <Input
              id="mrp"
              name="mrp"
              type="number"
              step="0.01"
              min="0"
              value={productData.mrp}
              onChange={handleInputChange}
              required
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (e.g., 75%)</Label>
            <Input
              id="discount"
              name="discount"
              value={productData.discount}
              onChange={handleInputChange}
              required
              disabled={isSaving}
              placeholder="e.g., 25% or ₹100 off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratings">Ratings (0-5)</Label>
          <Input
            id="ratings"
            name="ratings"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={productData.ratings}
            onChange={handleInputChange}
            required
            disabled={isSaving}
          />
        </div>

        {/* Product Images */}
        <div className="space-y-2">
          <Label>Product Images</Label>
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={src || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-black/70 hover:bg-black"
                    disabled={isSaving}
                    onClick={() => handleRemoveImage(index, index < productData.images.length)}
                  >
                    <Trash className="h-3 w-3 text-white" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ))}
              <div
                className="flex flex-col items-center justify-center aspect-square bg-gray-100 rounded-md cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                onClick={handleImageClick}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500 text-center">Add Image</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload multiple images for your product. First image will be the main image.
            </p>
          </div>
        </div>

        {/* Variations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Product Variations</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddVariation} disabled={isSaving}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Variation
            </Button>
          </div>
          {productData.variations.length === 0 && (
            <p className="text-sm text-gray-500">
              No variations added yet. Click "Add Variation" to add sizes and colors.
            </p>
          )}
          {productData.variations.map((variation, index) => (
            <div key={index} className="border rounded-md p-4 space-y-4 relative">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleRemoveVariation(index)}
                disabled={isSaving}
              >
                <MinusCircle className="h-4 w-4" />
                <span className="sr-only">Remove variation</span>
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-10">
                <div className="space-y-2">
                  <Label htmlFor={`color-${index}`}>Color</Label>
                  <Input
                    id={`color-${index}`}
                    value={variation.color}
                    onChange={(e) => handleVariationChange(index, "color", e.target.value)}
                    required
                    disabled={isSaving}
                    placeholder="e.g., Red, Blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`size-${index}`}>Size</Label>
                  <Input
                    id={`size-${index}`}
                    value={variation.size}
                    onChange={(e) => handleVariationChange(index, "size", e.target.value)}
                    required
                    disabled={isSaving}
                    placeholder="e.g., S, M, L, XL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`stock-${index}`}>Stock</Label>
                  <Input
                    id={`stock-${index}`}
                    type="number"
                    min="0"
                    value={variation.stock}
                    onChange={(e) => handleVariationChange(index, "stock", e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sku-${index}`}>SKU (Optional)</Label>
                  <Input
                    id={`sku-${index}`}
                    value={variation.sku || ""}
                    onChange={(e) => handleVariationChange(index, "sku", e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g., RED-S-001"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}
