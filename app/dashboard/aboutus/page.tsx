"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Upload, PlusCircle, MinusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/app/hooks/use-toast"
import type { IAboutUs, IVideo } from "@/app/lib/models/aboutus"

export default function AboutUsAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [aboutUsData, setAboutUsData] = useState<Partial<IAboutUs>>({
    videos: [],
  })

  const [videoPosterFiles, setVideoPosterFiles] = useState<File[][]>([])
  const [videoPosterPreviews, setVideoPosterPreviews] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchAboutUsContent()
  }, [])

  const fetchAboutUsContent = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/aboutus")
      if (!response.ok) {
        throw new Error("Failed to fetch About Us content")
      }
      const data = await response.json()
      if (data && Object.keys(data).length > 0) {
        setAboutUsData(data)
        setVideoPosterPreviews(data.videos.map((video: IVideo) => [video.poster]))
        setVideoPosterFiles(data.videos.map(() => []))
      } else {
        setAboutUsData({ videos: [] })
        setVideoPosterFiles([])
        setVideoPosterPreviews([])
      }
    } catch (err) {
      console.error("Fetch error:", err)
      toast({ title: "Error", description: "Failed to fetch About Us content", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoChange = (index: number, field: keyof IVideo, value: string) => {
    setAboutUsData((prev) => {
      const newVideos = [...(prev.videos || [])]
      newVideos[index] = {
        ...newVideos[index],
        [field]: value,
      } as IVideo
      return { ...prev, videos: newVideos }
    })
  }

  const handleAddVideo = () => {
    setAboutUsData((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), { url: "", poster: "" }],
    }))
    setVideoPosterFiles((prev) => [...prev, []])
    setVideoPosterPreviews((prev) => [...prev, []])
  }

  const handleRemoveVideo = (index: number) => {
    setAboutUsData((prev) => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index),
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
      const currentVideos = aboutUsData.videos || []
      const updatedVideos: IVideo[] = []

      for (let i = 0; i < currentVideos.length; i++) {
        const video = currentVideos[i]
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

        let posterUrl = video.poster

        if (posterFile) {
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

      const finalData = { videos: updatedVideos }

      const response = await fetch("/api/admin/aboutus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Save error response:", errorData)
        throw new Error(errorData.error || "Failed to save About Us content")
      }

      toast({ title: "Success", description: "About Us content saved successfully" })
      fetchAboutUsContent()
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

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/admin/aboutus`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete About Us content")
      toast({ title: "Deleted", description: "About Us content cleared successfully." })
      setAboutUsData({ videos: [] })
      setVideoPosterFiles([])
      setVideoPosterPreviews([])
      fetchAboutUsContent()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete About Us content",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
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
        <h1 className="text-2xl font-semibold">Manage About Us Videos</h1>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="text-lg"
            onClick={handleDeleteClick}
            disabled={isSaving || (aboutUsData.videos?.length || 0) === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Videos
          </Button>
          <Button type="submit" form="about-us-form" disabled={isSaving} className="text-lg bg-blue-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="about-us-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Videos</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddVideo} disabled={isSaving}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Video
            </Button>
          </div>
          {(aboutUsData.videos?.length || 0) === 0 && (
            <p className="text-sm text-gray-500">No videos added yet. Click "Add Video" to include videos.</p>
          )}
          {aboutUsData.videos?.map((video, index) => (
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
                    }}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Clear All Videos</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all videos from the About Us page? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
