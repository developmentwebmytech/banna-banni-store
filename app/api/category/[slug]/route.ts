import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import Category from "@/app/lib/models/herocategory" // Your existing Category model
import {Product} from "@/app/lib/models/product"

// GET products by category slug
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB()
    const { slug } = params

    // Decode the slug to handle spaces or special characters if necessary (though your slug generation handles this)
    const decodedSlug = decodeURIComponent(slug)

    // Find the category by its slug
    const category = await Category.findOne({ slug: decodedSlug })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Find products belonging to this category
    const products = await Product.find({ category_id: category._id }).sort({ createdAt: -1 })

    return NextResponse.json({ categoryName: category.name, products }, { status: 200 })
  } catch (error) {
    console.error("GET products by category slug error:", error)
    return NextResponse.json({ error: "Failed to fetch products for category" }, { status: 500 })
  }
}
