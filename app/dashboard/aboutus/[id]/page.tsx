"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload, PlusCircle, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/app/hooks/use-toast"
import type { IAboutUs, IVideo } from "@/app/lib/models/aboutus"

// Define a new interface for the component's state
interface AboutUsFormData {
  title: string
  description: string
  videos: IVideo[]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AboutUsEditPage({ params }: PageProps) {
  const { id } = await params

  return <AboutUsEditClient id={id} />
}

function AboutUsEditClient({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Use the new AboutUsFormData interface for the state
  const [aboutUsData, setAboutUsData] = useState<AboutUsFormData>({
    title: "",
    description: "",
    videos: [],
  })

  const [videoPosterFiles, setVideoPosterFiles] = useState<File[][]>([])
  const [videoPosterPreviews, setVideoPosterPreviews] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetchAboutUsContent()
    } else {
      setIsLoading(false)
    }
  }, [id, isNew]) // Added isNew to dependency array

  const fetchAboutUsContent = async () => {
    try {
      const response = await fetch(`/api/admin/aboutus/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch About Us content")
      }
      const data: IAboutUs = await response.json() // Cast to IAboutUs to ensure full type
      // Extract only the relevant fields for the component's state
      setAboutUsData({
        title: data.title ?? "", // Provide default empty string if undefined
        description: data.description ?? "", // Provide default empty string if undefined
        videos: data.videos,
      })
      setVideoPosterPreviews(data.videos.map((video: IVideo) => [video.poster]))
      setVideoPosterFiles(data.videos.map(() => []))
    } catch (err) {
      console.error("Fetch error:", err)
      toast({ title: "Error", description: "Failed to fetch About Us content", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAboutUsData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVideoChange = (index: number, field: keyof IVideo, value: string) => {
    setAboutUsData((prev) => {
      const newVideos = [...prev.videos]
      newVideos[index] = {
        ...newVideos[index],
        [field]: value,
      } as IVideo // Ensure the new video object conforms to IVideo
      return { ...prev, videos: newVideos }
    })
  }

  const handleAddVideo = () => {
    setAboutUsData((prev) => ({
      ...prev,
      videos: [...prev.videos, { url: "", poster: "" }],
    }))
    setVideoPosterFiles((prev) => [...prev, []])
    setVideoPosterPreviews((prev) => [...prev, []])
  }

  const handleRemoveVideo = (index: number) => {
    setAboutUsData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }))
    setVideoPosterFiles((prev) => prev.filter((_, i) => i !== index))
    setVideoPosterPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePosterClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click()
    }
  }

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>, videoIndex: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setVideoPosterFiles((prev) => {
        const newFiles = [...prev]
        newFiles[videoIndex] = [file]
        return newFiles
      })
      setVideoPosterPreviews((prev) => {
        const newPreviews = [...prev]
        newPreviews[videoIndex] = [URL.createObjectURL(file)]
        return newPreviews
      })
      toast({ title: "Poster selected", description: "Don't forget to save to upload the image" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSaving) return

    setIsSaving(true)

    try {
      // Validation
      if (!aboutUsData.title || !aboutUsData.description) {
        toast({
          title: "Validation Error",
          description: "Title and Description are required",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const updatedVideos: IVideo[] = []
      for (let i = 0; i < aboutUsData.videos.length; i++) {
        const video = aboutUsData.videos[i]
        const posterFile = videoPosterFiles[i]?.[0]

        if (!video.url) {
          toast({
            title: "Validation Error",
            description: `Video URL for video ${i + 1} is required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        let posterUrl = video.poster // Start with existing poster URL

        if (posterFile) {
          // Upload new poster image
          const formData = new FormData()
          formData.append("file", posterFile)

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            throw new Error(uploadError.error || `Failed to upload poster for video ${i + 1}`)
          }

          const result = await uploadResponse.json()
          posterUrl = result.url
        } else if (!posterUrl) {
          toast({
            title: "Validation Error",
            description: `Poster image for video ${i + 1} is required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        updatedVideos.push({ ...video, poster: posterUrl })
      }

      const finalData = { ...aboutUsData, videos: updatedVideos }

      const apiUrl = isNew ? "/api/admin/aboutus" : `/api/admin/aboutus/${id}`
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
        throw new Error(errorData.error || `Failed to ${isNew ? "create" : "update"} About Us content`)
      }

      const savedContent = await response.json()
      toast({
        title: "Success",
        description: isNew ? "About Us content created successfully" : "About Us content updated successfully",
      })

      router.push("/dashboard/aboutus") // Redirect back to the list
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save About Us content",
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
        <p className="mt-4 text-gray-500">Loading About Us content...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-blue-600 hover:text-white bg-transparent">
            <Link href="/dashboard/aboutus">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create New About Us Entry" : "Edit About Us Entry"}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-lg bg-[#000000a3] text-white"
            onClick={() => router.push("/dashboard/aboutus")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="about-us-form" disabled={isSaving} className="text-lg bg-blue-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="about-us-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={aboutUsData.title}
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
            value={aboutUsData.description}
            onChange={handleInputChange}
            rows={6}
            required
            disabled={isSaving}
          />
        </div>

        {/* Videos Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Videos</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddVideo} disabled={isSaving}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Video
            </Button>
          </div>
          {aboutUsData.videos.length === 0 && (
            <p className="text-sm text-gray-500">No videos added yet. Click "Add Video" to include videos.</p>
          )}
          {aboutUsData.videos.map((video, index) => (
            <div key={index} className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end relative">
              <div className="space-y-2">
                <Label htmlFor={`video-url-${index}`}>Video URL</Label>
                <Input
                  id={`video-url-${index}`}
                  value={video.url}
                  onChange={(e) => handleVideoChange(index, "url", e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`video-poster-${index}`}>Video Poster Image</Label>
                <div
                  className="flex flex-col items-center justify-center aspect-video bg-gray-100 rounded-md cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors relative"
                  onClick={() => handlePosterClick(index)}
                >
                  {videoPosterPreviews[index] && videoPosterPreviews[index][0] ? (
                    <Image
                      src={videoPosterPreviews[index][0] || "/placeholder.svg"}
                      alt={`Video poster ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500 text-center">Upload Poster</p>
                    </>
                  )}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el
                    }} // Changed this line
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePosterChange(e, index)}
                    disabled={isSaving}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Upload an image to be displayed before the video plays.</p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleRemoveVideo(index)}
                disabled={isSaving}
              >
                <MinusCircle className="h-4 w-4" />
                <span className="sr-only">Remove video</span>
              </Button>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}
