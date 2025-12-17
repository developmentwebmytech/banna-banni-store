import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import Category from "@/app/lib/models/herocategory"

// GET all categories
export async function GET() {
  try {
    await connectDB()
    const categories = await Category.find({}).sort({ order: 1, createdAt: -1 })
    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error("GET categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST: Create a new category
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, description, icon, color, image, isActive, order } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const newCategory = new Category({
      name,
      description: description || "",
      icon: icon || "",
      color: color || "#3B82F6",
      image: image || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    })

    const savedCategory = await newCategory.save()
    return NextResponse.json(savedCategory, { status: 201 })
  } catch (error: any) {
    console.error("POST category error:", error)
    return NextResponse.json({ error: error?.message || "Failed to create category" }, { status: 500 })
  }
}
