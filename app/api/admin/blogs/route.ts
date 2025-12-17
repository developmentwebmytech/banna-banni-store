import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import Blog from "@/app/lib/models/blog"

export async function GET() {
  await connectDB()
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 }) // Sort by newest first
    return NextResponse.json(blogs, { status: 200 })
  } catch (error) {
    console.error("Error fetching admin blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectDB()
  try {
    const body = await request.json()
    const newBlog = new Blog(body)
    await newBlog.save()
    return NextResponse.json(newBlog, { status: 201 })
  } catch (error: any) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: error.message || "Failed to create blog" }, { status: 500 })
  }
}
