import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import Blog from "@/app/lib/models/blog"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const blog = await Blog.findById(id)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }
    return NextResponse.json(blog, { status: 200 })
  } catch (error) {
    console.error(`Error fetching blog:`, error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedBlog = await Blog.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json(updatedBlog, { status: 200 })
  } catch (error: any) {
    console.error(`Error updating blog:`, error)
    return NextResponse.json(
      {
        error: error.message || "Failed to update blog",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deletedBlog = await Blog.findByIdAndDelete(id)
    if (!deletedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "Blog deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error deleting blog:`, error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
