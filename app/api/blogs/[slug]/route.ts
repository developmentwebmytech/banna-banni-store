import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import Blog from "@/app/lib/models/blog"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB()

  // Await the params Promise in Next.js 15
  const { slug } = await params

  try {
    const blog = await Blog.findOne({ slug })
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    return NextResponse.json(blog, { status: 200 })
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}
