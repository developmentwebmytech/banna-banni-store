"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/app/hooks/use-toast"

interface IBanner {
  _id?: string
  image: string
  link?: string
}

export default function EditBannerClientPage({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState<IBanner>({ image: "", link: "" })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")

  useEffect(() => {
    if (!isNew) {
      fetchBanner()
    } else {
      setIsLoading(false)
    }
  }, [id, isNew])

  const fetchBanner = async () => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`)
      if (!res.ok) throw new Error("Failed to fetch banner")
      const banner = await res.json()
      console.log("FORM: Fetched banner for edit:", banner)

      setData({
        image: banner.image || "",
        link: banner.link || "", // Ensure link is always a string
      })
      setPreviewImage(banner.image || "")
    } catch (err) {
      console.error("FORM: Fetch banner error:", err)
      toast({
        title: "Error",
        description: "Could not load banner",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log(`FORM: Field ${name} changed to:`, value)
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const result = await response.json()
      setData((prev) => ({ ...prev, image: result.url }))
      setPreviewImage(result.url)

      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("FORM: Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = () => {
    setData((prev) => ({ ...prev, image: "" }))
    setPreviewImage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    console.log("FORM: Current form data:", data)

    if (!data.image) {
      toast({
        title: "Validation Error",
        description: "Please select an image",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isNew ? `/api/admin/banners` : `/api/admin/banners/${id}`
      const method = isNew ? "POST" : "PUT"

      // Always send both fields
      const payload = {
        image: data.image,
        link: data.link || "", // Send empty string if no link
      }

      console.log("FORM: Submitting payload:", payload)

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()
      console.log("FORM: Server response:", responseData)

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to save")
      }

      toast({
        title: isNew ? "Banner Created" : "Banner Updated",
        description: "Banner saved successfully",
      })

      // Wait a bit before redirecting to ensure the data is saved
      setTimeout(() => {
        router.push("/dashboard/banners")
      }, 1000)
    } catch (err) {
      console.error("FORM: Submit error:", err)
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
            <Link href="/dashboard/banners">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create Banner" : "Edit Banner"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/banners")} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="banner-form"
            disabled={isSaving || isUploading}
            className="bg-blue-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form id="banner-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Banner Image *</Label>

            {/* Image Preview */}
            {previewImage && (
              <div className="relative w-full max-w-md">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <Image
                    src={previewImage || "/placeholder.svg"}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeImage}
                  disabled={isUploading || isSaving}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* File Upload Button */}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileSelect}
                disabled={isUploading || isSaving}
                className="w-fit bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : previewImage ? "Change Image" : "Select Image"}
              </Button>
              <p className="text-sm text-gray-500">Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)</p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading || isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Banner Link (Optional)</Label>
            <Input
              id="link"
              name="link"
              value={data.link || ""}
              onChange={handleChange}
              placeholder="/categories/anti-cancer or https://example.com"
              disabled={isSaving}
              className="w-full"
            />
            <div className="text-sm text-gray-500 space-y-2">
              <p>Enter a link to make this banner clickable:</p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <code>/categories/anti-cancer</code> - Internal page
                  </li>
                  <li>
                    <code>/products/featured</code> - Internal page
                  </li>
                  <li>
                    <code>https://example.com</code> - External website
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-xs text-blue-700">
                  <strong>Current value:</strong> "{data.link || "(empty)"}"
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
