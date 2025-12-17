import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import HeaderCategory from "@/app/lib/models/headercategory"

// GET all header categories
export async function GET() {
  try {
    await connectDB()
    const categories = await HeaderCategory.find({}).sort({ order: 1, createdAt: -1 })
    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error("GET header categories error:", error)
    return NextResponse.json({ error: "Failed to fetch header categories" }, { status: 500 })
  }
}

// POST: Create a new header category
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, title, description, images, icon, color, isActive, order } = body

    // Validate required fields
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

    const newCategory = new HeaderCategory({
      name,
      title,
      description: description || "",
      images: validatedImages,
      icon: icon || "",
      color: color || "#3B82F6",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    })

    const savedCategory = await newCategory.save()
    return NextResponse.json(savedCategory, { status: 201 })
  } catch (error: any) {
    console.error("POST header category error:", error)
    return NextResponse.json({ error: error?.message || "Failed to create header category" }, { status: 500 })
  }
}
