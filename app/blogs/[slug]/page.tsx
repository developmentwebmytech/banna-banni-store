"use client"

import Image from "next/image"
import { useEffect, useState, use } from "react"
import { notFound } from "next/navigation"
import type { IBlog } from "@/app/lib/models/blog"

export default function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [blog, setBlog] = useState<IBlog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            notFound() // Use Next.js notFound for 404 pages
          }
          throw new Error("Failed to fetch blog post details")
        }
        const data = await response.json()
        setBlog(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlog()
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading blog post...</p>
      </div>
    )
  }

  if (error || !blog) {
    // If there's an error and no blog data, or if blog is explicitly null after loading
    // and notFound wasn't triggered (e.g., network error, but not 404 from API)
    return (
      <div className="p-4 lg:p-6 text-center text-red-500 min-h-screen flex items-center justify-center">
        <p>Error: {error || "Blog post not found."}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Image
        src={blog.image || "/placeholder.svg"}
        alt={blog.title}
        width={1200}
        height={400}
        className="w-full h-80 object-cover rounded shadow mb-6"
        priority
      />
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-700 mb-4">{blog.description}</p>
      <div className="text-gray-800 leading-relaxed">{blog.content}</div>
    </div>
  )
}
