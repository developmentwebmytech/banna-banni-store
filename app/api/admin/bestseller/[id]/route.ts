import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import BestSellerProduct from "@/app/lib/models/bestseller"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const product = await BestSellerProduct.findById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error(`Error fetching best seller product:`, error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedProduct = await BestSellerProduct.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error: any) {
    console.error(`Error updating best seller product:`, error)
    return NextResponse.json(
      {
        error: error.message || "Failed to update product",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deletedProduct = await BestSellerProduct.findByIdAndDelete(id)
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error deleting best seller product:`, error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
