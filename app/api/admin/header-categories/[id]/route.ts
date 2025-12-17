import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import HeaderCategory from "@/app/lib/models/headercategory"

// GET a header category by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    const category = await HeaderCategory.findById(id)
    if (!category) {
      return NextResponse.json({ error: "Header category not found" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("GET header category error:", error)
    return NextResponse.json({ error: "Failed to fetch header category" }, { status: 500 })
  }
}

// UPDATE a header category by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await req.json()
    const { name, title, description, images, icon, color, isActive, order } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: "Category title is required" }, { status: 400 })
    }

    const validatedImages = Array.isArray(images)
      ? images.map((img: any) => {
          if (typeof img === "string") {
            // Convert old string format to new object format
            return { url: img, categoryName: "" }
          }
          return {
            url: img.url || "",
            categoryName: img.categoryName || "",
          }
        })
      : []

    const updated = await HeaderCategory.findByIdAndUpdate(
      id,
      {
        name,
        title,
        description: description || "",
        images: validatedImages,
        icon: icon || "",
        color: color || "#3B82F6",
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
      { new: true },
    )

    if (!updated) {
      return NextResponse.json({ error: "Header category not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT header category error:", error)
    return NextResponse.json({ error: "Failed to update header category" }, { status: 500 })
  }
}

// DELETE a header category by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    const deleted = await HeaderCategory.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Header category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Header category deleted successfully" })
  } catch (error) {
    console.error("DELETE header category error:", error)
    return NextResponse.json({ error: "Failed to delete header category" }, { status: 500 })
  }
}
