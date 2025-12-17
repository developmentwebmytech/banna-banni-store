"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/app/hooks/use-toast"

// Define a plain object interface for blog data
interface BlogData {
  _id?: string
  title: string
  description: string
  image: string
  content: string
  slug: string
  createdAt?: Date
  updatedAt?: Date
}

interface PageProps {
  params: Promise<{ id: string }>
}

// Server Component that awaits params and passes to client component
export default async function BlogEditPage({ params }: PageProps) {
  const { id } = await params
  return <BlogEditClient id={id} />
}

function BlogEditClient({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    description: "",
    image: "",
    content: "",
    slug: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetchBlog()
    } else {
      setIsLoading(false)
    }
  }, [id, isNew])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/marketmanager/blogs/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch blog post")
      }
      const data = await response.json()

      // Convert the response to our BlogData interface
      setBlogData({
        _id: data._id,
        title: data.title || "",
        description: data.description || "",
        image: data.image || "",
        content: data.content || "",
        slug: data.slug || "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })

      setImagePreview(data.image || "")
    } catch (err) {
      console.error("Fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to fetch blog post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBlogData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      toast({
        title: "Image selected",
        description: "Don't forget to save to upload the image",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSaving) return

    setIsSaving(true)

    try {
      // Validation
      const requiredFields: (keyof BlogData)[] = ["title", "description", "content"]
      for (const field of requiredFields) {
        if (!blogData[field]) {
          toast({
            title: "Validation Error",
            description: `${field} is required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      if (!imageFile && !blogData.image) {
        toast({
          title: "Validation Error",
          description: "An image is required for the blog post",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      let uploadedImageUrl = blogData.image

      // Upload new image if a file is selected
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || "Failed to upload image")
        }

        const result = await uploadResponse.json()
        uploadedImageUrl = result.url
      }

      const finalData = { ...blogData, image: uploadedImageUrl }

      const apiUrl = isNew ? "/api/marketmanager/blogs" : `/api/marketmanager/blogs/${id}`
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
        throw new Error(errorData.error || `Failed to ${isNew ? "create" : "update"} blog post`)
      }

      const savedBlog = await response.json()
      toast({
        title: "Success",
        description: isNew ? "Blog post created successfully" : "Blog post updated successfully",
      })

      router.push("/market-manager-dashboard/blogs")
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
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
          <Button variant="outline" size="icon" asChild className="hover:bg-blue-600 hover:text-white bg-transparent">
            <Link href="/market-manager-dashboard/blogs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create New Blog Post" : "Edit Blog Post"}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-lg bg-[#000000a3] text-white"
            onClick={() => router.push("/market-manager-dashboard/blogs")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="blog-form" disabled={isSaving} className="text-lg bg-teal-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={blogData.title}
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
            value={blogData.description}
            onChange={handleInputChange}
            rows={3}
            required
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            value={blogData.content}
            onChange={handleInputChange}
            rows={10}
            required
            disabled={isSaving}
            placeholder="Write your blog content here. You can use Markdown or plain text."
          />
        </div>

        {/* Blog Image */}
        <div className="space-y-2">
          <Label>Blog Image</Label>
          <div className="border rounded-md p-4 bg-gray-50 flex flex-col items-center justify-center">
            <div
              className="relative w-full h-48 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Blog image preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 text-center">Upload Image</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 mt-2">Upload a main image for your blog post.</p>
          </div>
        </div>
      </form>
    </div>
  )
}
