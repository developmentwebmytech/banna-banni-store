"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/app/hooks/use-toast"

interface ICategory {
  _id?: string
  name: string
  slug?: string
  description?: string
  icon?: string
  color?: string
  image?: string
  isActive: boolean
  order: number
}

export default function EditCategoryClientPage({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<ICategory>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    image: "",
    isActive: true,
    order: 0,
  })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetchCategory()
    } else {
      setIsLoading(false)
    }
  }, [id])

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`)
      if (!res.ok) throw new Error("Failed to fetch category")
      const category = await res.json()
      setData(category)
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load category",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "categories")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()
      setData((prev) => ({ ...prev, image: result.url }))

      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setData((prev) => ({ ...prev, image: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    if (!data.name) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isNew ? `/api/admin/categories` : `/api/admin/categories/${id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to save")
      }

      toast({ title: isNew ? "Category Created" : "Category Updated" })
      router.push("/dashboard/navcategories")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-blue-600 hover:text-white bg-transparent">
            <Link href="/dashboard/navcategories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create Category" : "Edit Category"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/categories")} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={isSaving} className="bg-teal-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="category-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="e.g., Personal Care"
            disabled={isSaving}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug (auto-generated from name)</Label>
          <Input
            id="slug"
            name="slug"
            value={data.slug}
            onChange={handleChange}
            placeholder="auto-generated-from-name"
            disabled={isSaving}
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Leave empty to auto-generate from name. This will be used in the URL: /categories/your-slug
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Category description..."
            disabled={isSaving}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Category Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                name="color"
                type="color"
                value={data.color}
                onChange={handleChange}
                disabled={isSaving}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                name="color"
                value={data.color}
                onChange={handleChange}
                placeholder="#3B82F6"
                disabled={isSaving}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={data.order}
              onChange={handleChange}
              placeholder="0"
              disabled={isSaving}
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon (optional)</Label>
          <Input
            id="icon"
            name="icon"
            value={data.icon}
            onChange={handleChange}
            placeholder="e.g., 🏥 or icon class name"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Category Image</Label>
          <div className="space-y-4">
            {data.image ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                <Image src={data.image || "/placeholder.svg"} alt="Category preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isSaving || isUploading}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving || isUploading}
                  className="cursor-pointer bg-transparent"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </span>
                </Button>
              </label>
              {data.image && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={removeImage}
                  disabled={isSaving}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Recommended: 400x400px or larger. Max file size: 5MB. Supported formats: JPG, PNG, WebP
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isActive"
              checked={data.isActive}
              onCheckedChange={(checked) => setData((prev) => ({ ...prev, isActive: !!checked }))}
              disabled={isSaving}
            />
            <Label htmlFor="isActive">Active (visible in header)</Label>
          </div>
        </div>
      </form>
    </div>
  )
}
