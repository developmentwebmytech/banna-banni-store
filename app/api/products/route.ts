import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Product } from "@/app/lib/models/product"
import slugify from "slugify"

export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name") || ""
    const page = Number(searchParams.get("page")) || 1
    const per_page = Number(searchParams.get("per_page")) || 20

    const query: any = { status: "live" }
    if (name) {
      query.name = { $regex: name, $options: "i" }
    }

    const totalProducts = await Product.countDocuments(query)
    const totalPages = Math.ceil(totalProducts / per_page)

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .lean()

    return NextResponse.json({
      products,
      meta: {
        totalProducts,
        totalPages,
        currentPage: page,
        perPage: per_page,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()

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
      total_price,
      instagram_url, // accept instagram_url
    
    } = body

    if (
      !name ||
      !description ||
      price == null ||
      !category_id ||
      !brand_id ||
      !total_price ||
      !variations ||
      variations.length === 0
    ) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 })
    }

    const productData = {
      name,
      description,
      price: Number(price),
      total_price: Number(total_price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      discount,
      rating: rating ? Number(rating) : undefined,
      images: images || [],
      category_id,
      brand_id,
      variations: (variations || []).map((v: any) => ({
        size: v.size,
        color: v.color,
        stock: v.stock,
        price_modifier: v.price_modifier !== undefined ? Number(v.price_modifier) : undefined,
      })),
      slug: slugify(name, { lower: true, strict: true }),
      relatedProducts: relatedProducts || [],
     instagram_url: instagram_url, // 👈 bas aise

    }

    const newProduct = await Product.create(productData)
    const createdProduct = await Product.findById(newProduct._id).lean()

    return NextResponse.json(createdProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
