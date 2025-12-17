import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import ShopByCategoryProduct from "@/app/lib/models/shopbycategory"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const product = await ShopByCategoryProduct.findById(id)
    if (!product) {
      return NextResponse.json({ error: "Category product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching category product:", error)
    return NextResponse.json({ error: "Failed to fetch category product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedProduct = await ShopByCategoryProduct.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedProduct) {
      return NextResponse.json({ error: "Category product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating category product:", error)
    return NextResponse.json({ error: "Failed to update category product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deletedProduct = await ShopByCategoryProduct.findByIdAndDelete(id)
    if (!deletedProduct) {
      return NextResponse.json({ error: "Category product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category product deleted successfully" })
  } catch (error) {
    console.error("Error deleting category product:", error)
    return NextResponse.json({ error: "Failed to delete category product" }, { status: 500 })
  }
}
