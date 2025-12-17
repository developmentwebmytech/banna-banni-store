import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Product } from "@/app/lib/models/product"
import slugify from "slugify"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const product = await Product.findById(id).lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.relatedProducts && product.relatedProducts.length > 0) {
      try {
        const relatedProductsData = await Product.find({
          _id: { $in: product.relatedProducts },
        })
          .select("name images price")
          .lean()
        ;(product as any).relatedProducts = relatedProductsData
      } catch {
        ;(product as any).relatedProducts = []
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    const body = await req.json()
    const {
      name,
      description,
      price,
      images,
      category_id,
      brand_id,
      variations,
      oldPrice,
      discount,
      rating,
      relatedProducts,
      purchased_price,
      transport_cost,
      other_cost, // Added other_cost field to destructuring
      gst,
      discount_price,
      discount_reason,
      total_price,
      status,
      bestseller,
      trending,
      newarrival,
      instagram_url,
    } = body

    if (!name) {
      return NextResponse.json({ error: "Product name is required for slug generation" }, { status: 400 })
    }

    const updatedData: any = {
      name,
      description: description || "",
      price: price ? Number(price) : 0,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      discount,
      rating: rating ? Number(rating) : undefined,
      purchased_price: purchased_price ? Number(purchased_price) : undefined,
      transport_cost: transport_cost ? Number(transport_cost) : undefined,
      other_cost: other_cost ? Number(other_cost) : undefined, // Added other_cost to updatedData object
      gst: gst || "0%",
      discount_price: discount_price ? Number(discount_price) : undefined,
      discount_reason,
      total_price: total_price ? Number(total_price) : undefined,
      status: status || "draft",
      images: images || [],
      category_id: category_id || null,
      brand_id: brand_id || null,
      variations: variations || [],
      slug: slugify(name, { lower: true, strict: true }),
      relatedProducts: relatedProducts || [],
      updatedAt: new Date(),
      bestseller: bestseller || false,
      trending: trending || false,
      newarrival: newarrival || false,
      instagram_url: instagram_url,
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (updatedProduct.relatedProducts && updatedProduct.relatedProducts.length > 0) {
      try {
        const relatedProductsData = await Product.find({
          _id: { $in: updatedProduct.relatedProducts },
        })
          .select("name images price")
          .lean()
        ;(updatedProduct as any).relatedProducts = relatedProductsData
      } catch {
        ;(updatedProduct as any).relatedProducts = []
      }
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const deletedProduct = await Product.findByIdAndDelete(id)

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
