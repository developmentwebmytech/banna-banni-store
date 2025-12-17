import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import TrendingProduct from "@/app/lib/models/trending"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params

  try {
    const product = await TrendingProduct.findOne({ slug })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error(`Error fetching trending product with slug ${slug}:`, error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
