"use client"

import { useEffect, useState } from "react"
import type { IAboutUs } from "@/app/lib/models/aboutus"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Default content for videos if API is empty or fails
const defaultVideos = [
  {
    url: "https://bannabannistore.com/videos/v1.mp4",
    poster: "/stich.jpg",
  },
  {
    url: "https://bannabannistore.com/videos/v2.mp4",
    poster: "/embriod.jpg",
  },
]

export default function AboutUs() {
  const [videos, setVideos] = useState<IAboutUs["videos"]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0)
  const videosPerSlide = 2

  const prevVideoSlide = () => {
    setCurrentVideoSlide((prev) => Math.max(prev - 1, 0))
  }

  const nextVideoSlide = () => {
    setCurrentVideoSlide((prev) => Math.min(prev + 1, Math.ceil(videos.length / videosPerSlide) - 1))
  }

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      try {
        const response = await fetch("/api/aboutus")
        if (!response.ok) {
          throw new Error("Failed to fetch About Us content")
        }
        const data = await response.json()
        // If data exists and has videos, use them, otherwise fallback to default
        if (data && data.videos && data.videos.length > 0) {
          setVideos(data.videos)
        } else {
          setVideos(defaultVideos)
        }
      } catch (err: any) {
        setError(err.message)
        setVideos(defaultVideos) // Fallback to default on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchAboutUsContent()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-white text-center">
        <p>Loading About Us content...</p>
      </section>
    )
  }

  if (error && videos.length === 0) {
    return (
      <section className="py-16 bg-white text-center text-red-500">
        <p>Error: {error}. Displaying default videos.</p>
      </section>
    )
  }

  return (
    <section className="py-10 bg-white mt-4">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">About us</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10">
          {
            "We are Manufacturer of women clothing Since 2021. We sell only Premium Quality Product in our Store and we can not compromise in Quality. So don’t Compare Our rate with any other Seller or Website."
          }
        </p>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentVideoSlide * (100 / videosPerSlide)}%)` }}
            >
              {videos.map((video, index) => (
                <div key={index} className="flex-shrink-0 px-3" style={{ width: `${100 / videosPerSlide}%` }}>
                  <div className="shadow-lg rounded-md overflow-hidden">
                    <video controls width="100%" className="w-full h-auto" poster={video.poster}>
                      <source src={video.url} type="video/mp4" />
                      {"Your browser does not support the video tag."}
                    </video>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          {videos.length > videosPerSlide && (
            <>
              <button
                onClick={prevVideoSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={nextVideoSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Pagination dots */}
          {videos.length > videosPerSlide && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: Math.ceil(videos.length / videosPerSlide) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentVideoSlide === index ? "bg-gray-800" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
