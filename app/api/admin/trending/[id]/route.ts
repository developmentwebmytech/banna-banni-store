import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import TrendingProduct from "@/app/lib/models/trending"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const product = await TrendingProduct.findById(id)
    if (!product) {
      return NextResponse.json({ error: "Trending product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching trending product:", error)
    return NextResponse.json({ error: "Failed to fetch trending product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedProduct = await TrendingProduct.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedProduct) {
      return NextResponse.json({ error: "Trending product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating trending product:", error)
    return NextResponse.json({ error: "Failed to update trending product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deletedProduct = await TrendingProduct.findByIdAndDelete(id)
    if (!deletedProduct) {
      return NextResponse.json({ error: "Trending product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Trending product deleted successfully" })
  } catch (error) {
    console.error("Error deleting trending product:", error)
    return NextResponse.json({ error: "Failed to delete trending product" }, { status: 500 })
  }
}
