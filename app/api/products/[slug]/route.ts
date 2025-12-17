import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Product } from "@/app/lib/models/product"

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB()

    const { slug } = params
    console.log(`API: Fetching product with slug: ${slug}`)

    const product = await Product.findOne({ slug }).lean()

    if (!product) {
      console.log(`API: Product not found with slug: ${slug}`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    let relatedProductsData = []
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      try {
        relatedProductsData = await Product.find({
          _id: { $in: product.relatedProducts },
        })
          .select("name description price oldPrice discount images slug rating total_price instagram_url")
          .lean()
      } catch (error) {
        console.log("Error fetching related products, continuing without them:", error)
      }
    }

    const productWithRelated = {
      ...product,
      relatedProducts: relatedProductsData,
    }

    console.log(`API: Successfully found product: ${product.name}`)
    return NextResponse.json(productWithRelated)
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
