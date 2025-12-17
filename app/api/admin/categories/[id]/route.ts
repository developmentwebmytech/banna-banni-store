import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import Category from "@/app/lib/models/herocategory"

// GET a category by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("GET category error:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

// UPDATE a category by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await req.json()
    const { name, description, icon, color, image, isActive, order } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name,
        description: description || "",
        icon: icon || "",
        color: color || "#3B82F6",
        image: image || "",
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
      { new: true },
    )

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT category error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE a category by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    const deleted = await Category.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("DELETE category error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
