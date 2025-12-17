import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import BestSellerProduct from "@/app/lib/models/bestseller"
import type { NextRequest } from "next/server"

// Updated interface for Next.js 15 - params is now a Promise
interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB()
    // Await the params Promise in Next.js 15
    const { slug } = await context.params

    const product = await BestSellerProduct.findOne({ slug }).lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error(`Error fetching best seller product:`, error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectDB()
    // Await the params Promise in Next.js 15
    const { slug } = await context.params
    const body = await request.json()

    const updatedProduct = await BestSellerProduct.findOneAndUpdate({ slug }, body, {
      new: true,
      runValidators: true,
    }).lean()

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectDB()
    // Await the params Promise in Next.js 15
    const { slug } = await context.params

    const deletedProduct = await BestSellerProduct.findOneAndDelete({ slug }).lean()

    if (!deletedProduct || typeof deletedProduct !== "object") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "Product deleted successfully",
        deletedProduct: {
          title: (deletedProduct as any).title,
          slug: (deletedProduct as any).slug,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error deleting best seller product:`, error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
