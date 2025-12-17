"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/app/hooks/use-toast"

interface IHeaderCategory {
  _id?: string
  name: string
  slug?: string
  title: string
  description?: string
  images: Array<{
    url: string
    categoryName: string
  }>
  icon?: string
  color?: string
  isActive: boolean
  order: number
}

export default function EditHeaderCategoryClientPage({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<IHeaderCategory>({
    name: "",
    slug: "",
    title: "",
    description: "",
    images: [],
    icon: "",
    color: "#3B82F6",
    isActive: true,
    order: 0,
  })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([])

  useEffect(() => {
    if (!isNew) {
      fetchCategory()
    } else {
      setIsLoading(false)
    }
  }, [id])

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/admin/header-categories/${id}`)
      if (!res.ok) throw new Error("Failed to fetch header category")
      const category = await res.json()
      setData(category)
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load header category",
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

  const handleFileUpload = async (file: File, index: number) => {
    if (!file) return

    const newUploadingImages = [...uploadingImages]
    newUploadingImages[index] = true
    setUploadingImages(newUploadingImages)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const result = await response.json()

      const newImages = [...data.images]
      newImages[index] = { ...newImages[index], url: result.url }
      setData((prev) => ({ ...prev, images: newImages }))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      const newUploadingImages = [...uploadingImages]
      newUploadingImages[index] = false
      setUploadingImages(newUploadingImages)
    }
  }

  const handleImageChange = (index: number, field: "url" | "categoryName", value: string) => {
    const newImages = [...data.images]
    newImages[index] = { ...newImages[index], [field]: value }
    setData((prev) => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setData((prev) => ({ ...prev, images: [...prev.images, { url: "", categoryName: "" }] }))
    setUploadingImages((prev) => [...prev, false])
  }

  const removeImageField = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index)
    setData((prev) => ({ ...prev, images: newImages }))
    setUploadingImages((prev) => prev.filter((_, i) => i !== index))
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

    if (!data.title) {
      toast({
        title: "Validation Error",
        description: "Category title is required.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isNew ? `/api/admin/header-categories` : `/api/admin/header-categories/${id}`
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

      toast({ title: isNew ? "Header Category Created" : "Header Category Updated" })
      router.push("/dashboard/header-categories")
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
            <Link href="/dashboard/header-categories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{isNew ? "Create Header Category" : "Edit Header Category"}</h1>
            <p className="text-gray-600 mt-1">Manage main navigation categories for your header</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/header-categories")} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="header-category-form" disabled={isSaving} className="bg-teal-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="header-category-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="e.g., Women, Bridal, Men"
            disabled={isSaving}
            required
          />
          <p className="text-xs text-gray-500">This will appear in the main header navigation</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Display Title *</Label>
          <Input
            id="title"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="e.g., All Collections, Women's Fashion"
            disabled={isSaving}
            required
          />
          <p className="text-xs text-gray-500">This will be displayed as the main heading on the category page</p>
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
          <p className="text-xs text-gray-500">Leave empty to auto-generate from name. Used for navigation routing.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Category Description</Label>
          <Textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Describe this category for visitors (e.g., 'versatile accessories designed for carrying personal items...')"
            disabled={isSaving}
            rows={4}
          />
          <p className="text-xs text-gray-500">This description will appear on the category page below the title</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Category Images & Names</Label>
            <Button type="button" variant="outline" size="sm" onClick={addImageField} disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          {data.images.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No images added yet</p>
              <Button
                type="button"
                variant="outline"
                onClick={addImageField}
                className="mt-2 bg-transparent"
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.images.map((image, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Image {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeImageField(index)}
                      disabled={isSaving || uploadingImages[index]}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`categoryName-${index}`}>Category Name *</Label>
                    <Input
                      id={`categoryName-${index}`}
                      value={image.categoryName}
                      onChange={(e) => handleImageChange(index, "categoryName", e.target.value)}
                      placeholder="e.g., Beaded Placemats, Hand Bags, Clutch Purse"
                      disabled={isSaving}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image Upload</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file, index)
                        }
                      }}
                      disabled={isSaving || uploadingImages[index]}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                  </div>

                  {uploadingImages[index] ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : image.url ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.categoryName || `Category image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                      <div className="flex-1">
                        <Input
                          value={image.url}
                          onChange={(e) => handleImageChange(index, "url", e.target.value)}
                          placeholder="Or enter image URL manually"
                          disabled={isSaving}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <Input
                      value={image.url}
                      onChange={(e) => handleImageChange(index, "url", e.target.value)}
                      placeholder="Or enter image URL manually"
                      disabled={isSaving}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            Upload images with category names that will be displayed in the category collections grid
          </p>
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
            <p className="text-xs text-gray-500">Lower numbers appear first</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon (optional)</Label>
          <Input
            id="icon"
            name="icon"
            value={data.icon}
            onChange={handleChange}
            placeholder="e.g., 👗 or icon class name"
            disabled={isSaving}
          />
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
            <Label htmlFor="isActive">Active (visible in header navigation)</Label>
          </div>
        </div>
      </form>
    </div>
  )
}
