"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
// Assuming IBlog is for your database model, we'll define a simpler type for client-side data
// import type { IBlog } from "@/app/lib/models/blog"; // Keep this if IBlog is used elsewhere for ORM types

// Define a type for the blog data that matches your plain JavaScript objects
interface BlogData {
  _id: string
  slug: string
  title: string
  description: string
  image: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// Default blogs to display if API is empty or fails
const defaultBlogs: BlogData[] = [
  {
    _id: "default-blog-1",
    slug: "spiciatis-nesciunt-1",
    title: "Spiciatis Nesciunt - Default 1",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, sunt perspiciatis nesciunt, rerum eos, ut quisquam atque tenetur voluptatibus.",
    image: "/blog.webp",
    content: "Full content of default blog 1.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default-blog-2",
    slug: "spiciatis-nesciunt-2",
    title: "Spiciatis Nesciunt - Default 2",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, sunt perspiciatis nesciunt, rerum eos, ut quisquam atque tenetur voluptatibus.",
    image: "/blog.webp",
    content: "Full content of default blog 2.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default-blog-3",
    slug: "spiciatis-nesciunt-3",
    title: "Spiciatis Nesciunt - Default 3",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, sunt perspiciatis nesciunt, rerum eos, ut quisquam atque tenetur voluptatibus.",
    image: "/blog.webp",
    content: "Full content of default blog 3.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogData[]>([]) // Use BlogData here
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs")
        if (!response.ok) {
          throw new Error("Failed to fetch blog posts")
        }
        const data: BlogData[] = await response.json() // Cast incoming data to BlogData[]
        if (data && data.length > 0) {
          setBlogs(data)
        } else {
          setBlogs(defaultBlogs)
        }
      } catch (err: any) {
        setError(err.message)
        setBlogs(defaultBlogs) // Fallback to default on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Loading blog posts...</p>
      </div>
    )
  }

  if (error && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-white text-center text-red-500 flex items-center justify-center">
        <p>Error: {error}. Displaying default blog posts.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-teal-800 py-15 text-center text-white text-4xl font-bold">Our Blogs</div>

      {/* Article Section */}
      <div className="max-w-8xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Read Our Articles</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Welcome to “Live Well, Be Bold” — a lifestyle blog designed to inspire you to live intentionally, fearlessly,
          and with purpose. Whether you're seeking tips on wellness, productivity, travel, or personal style.
        </p>
      </div>

      {/* Blog Cards */}
      <div className="max-w-8xl mx-auto px-4 pb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link key={blog._id} href={`/blogs/${blog.slug}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <Image
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                <p className="text-gray-700 text-sm">{blog.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
