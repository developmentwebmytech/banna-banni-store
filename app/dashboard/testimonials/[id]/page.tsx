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

// Define interface for testimonial data
interface TestimonialData {
  _id?: string
  name: string
  image: string
  rating: number
  review: string
  sku?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TestimonialEditPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [id, setId] = useState<string>("")
  const [isNew, setIsNew] = useState(false)
  const [testimonialData, setTestimonialData] = useState<TestimonialData>({
    name: "",
    image: "",
    rating: 0,
    review: "",
    sku: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      const testimonialId = resolvedParams.id
      setId(testimonialId)
      setIsNew(testimonialId === "new")
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!id) return // Wait for id to be set

    if (!isNew) {
      fetchTestimonial()
    } else {
      setIsLoading(false)
    }
  }, [id, isNew])

  const fetchTestimonial = async () => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch testimonial")
      }
      const data = await response.json()

      // Convert the response to our TestimonialData interface
      setTestimonialData({
        _id: data._id,
        name: data.name || "",
        image: data.image || "",
        rating: data.rating || 0,
        review: data.review || "",
        sku: data.sku || "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })

      setImagePreview(data.image || "")
    } catch (err) {
      console.error("Fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to fetch testimonial",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTestimonialData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number.parseFloat(value) || 0 : value,
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
      const requiredFields: (keyof TestimonialData)[] = ["name", "review"]
      for (const field of requiredFields) {
        if (!testimonialData[field]) {
          toast({
            title: "Validation Error",
            description: `${field} is required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      if (!imageFile && !testimonialData.image) {
        toast({
          title: "Validation Error",
          description: "An image is required for the testimonial",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      if (testimonialData.rating < 0 || testimonialData.rating > 5) {
        toast({
          title: "Validation Error",
          description: "Rating must be between 0 and 5",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      let uploadedImageUrl = testimonialData.image // Start with existing image URL

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

      const finalData = { ...testimonialData, image: uploadedImageUrl }

      const apiUrl = isNew ? "/api/admin/testimonials" : `/api/admin/testimonials/${id}`
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
        throw new Error(errorData.error || `Failed to ${isNew ? "create" : "update"} testimonial`)
      }

      const savedTestimonial = await response.json()
      toast({
        title: "Success",
        description: isNew ? "Testimonial created successfully" : "Testimonial updated successfully",
      })

      router.push("/dashboard/testimonials")
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save testimonial",
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
          <Button variant="outline" size="icon" asChild className="hover:bg-blue-600 hover:text-white bg-transparent">
            <Link href="/dashboard/testimonials">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create New Testimonial" : "Edit Testimonial"}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-lg bg-[#000000a3] text-white"
            onClick={() => router.push("/dashboard/testimonials")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="testimonial-form" disabled={isSaving} className="text-lg bg-blue-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Reviewer Name</Label>
          <Input
            id="name"
            name="name"
            value={testimonialData.name}
            onChange={handleInputChange}
            required
            disabled={isSaving}
            placeholder="Enter reviewer's name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review">Review Text</Label>
          <Textarea
            id="review"
            name="review"
            value={testimonialData.review}
            onChange={handleInputChange}
            rows={4}
            required
            disabled={isSaving}
            placeholder="Enter the testimonial review text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={testimonialData.rating}
              onChange={handleInputChange}
              required
              disabled={isSaving}
              placeholder="4.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">Product SKU (Optional)</Label>
            <Input
              id="sku"
              name="sku"
              value={testimonialData.sku || ""}
              onChange={handleInputChange}
              disabled={isSaving}
              placeholder="e.g., PROD-001"
            />
          </div>
        </div>

        {/* Reviewer Image */}
        <div className="space-y-2">
          <Label>Reviewer Image</Label>
          <div className="border rounded-md p-4 bg-gray-50 flex flex-col items-center justify-center">
            <div
              className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Reviewer image preview"
                  fill
                  className="object-cover"
                  sizes="128px"
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
            <p className="text-xs text-gray-500 mt-2">Upload a profile image for the reviewer.</p>
          </div>
        </div>
      </form>
    </div>
  )
}
