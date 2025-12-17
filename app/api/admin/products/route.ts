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
    const sortBy = searchParams.get("sortBy") || ""

    let query: any = {}
    if (name) {
      query = { name: { $regex: name, $options: "i" } }
    }

    let sortOptions: any = { createdAt: -1 }
    if (sortBy === "lowToHigh") sortOptions = { price: 1 }
    else if (sortBy === "highToLow") sortOptions = { price: -1 }
    else if (sortBy === "rating") sortOptions = { rating: -1 }

    const totalProducts = await Product.countDocuments(query)
    const totalPages = Math.ceil(totalProducts / per_page)

    const products = await Product.find(query)
      .populate("category_id", "name")
      .populate("brand_id", "name")
      .sort(sortOptions)
      .skip((page - 1) * per_page)
      .limit(per_page)
      .lean()

    return NextResponse.json({
      products,
      meta: { totalProducts, totalPages, currentPage: page, perPage: per_page },
    })
  } catch (error) {
    console.error("Fetch products error:", error)
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
      purchased_price,
      transport_cost,
      other_cost,
      gst,
      discount_price,
      discount_reason,
      total_price,
      status,
      bestseller,
      trending,
      newarrival,
      relatedProducts,
      instagram_url,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required for slug generation" },
        { status: 400 }
      )
    }

    // ✅ Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1

    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`
    }

    const newProduct = new Product({
      name,
      description: description || "",
      price: price ? Number(price) : 0,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      discount,
      rating: rating ? Number(rating) : undefined,
      purchased_price: purchased_price ? Number(purchased_price) : undefined,
      transport_cost: transport_cost ? Number(transport_cost) : undefined,
      other_cost: other_cost ? Number(other_cost) : undefined,
      gst: gst || "0%",
      discount_price: discount_price ? Number(discount_price) : undefined,
      discount_reason,
      total_price: total_price ? Number(total_price) : undefined,
      status: status || "draft",
      images: images || [],
      category_id: category_id || null,
      brand_id: brand_id || null,
      variations: (variations || []).map((v: any) => ({
        size: v.size || "",
        color: v.color || "",
        stock: v.stock ? Number(v.stock) : 0,
        price_modifier: v.price_modifier ? Number(v.price_modifier) : 0,
      })),
      slug,
      bestseller: bestseller || false,
      trending: trending || false,
      newarrival: newarrival || false,
      relatedProducts: relatedProducts || [],
      instagram_url: instagram_url || null,
    })

    const savedProduct = await newProduct.save()

    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("category_id", "name")
      .populate("brand_id", "name")
      .lean()

    return NextResponse.json(populatedProduct, { status: 201 })
  } catch (error: any) {
    console.error("Product create error:", error)

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Slug already exists. Please try with a different product name." },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
