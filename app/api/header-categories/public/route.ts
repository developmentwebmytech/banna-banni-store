import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import HeaderCategory from "@/app/lib/models/headercategory"

// GET all active header categories for public use with new fields
export async function GET() {
  try {
    await connectDB()
    const categories = await HeaderCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select("name slug title description images icon color order createdAt updatedAt")

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error("GET public header categories error:", error)
    return NextResponse.json({ error: "Failed to fetch header categories" }, { status: 500 })
  }
}
