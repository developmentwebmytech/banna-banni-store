import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import Blog from "@/app/lib/models/blog"

export async function GET() {
  await connectDB()
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 }) // Sort by newest first
    return NextResponse.json(blogs, { status: 200 })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
