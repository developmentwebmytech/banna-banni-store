import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import TrendingProduct from "@/app/lib/models/trending"

export async function GET() {
  await connectDB()
  try {
    const products = await TrendingProduct.find({})
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching admin trending products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectDB()
  try {
    const body = await request.json()
    const newProduct = new TrendingProduct(body)
    await newProduct.save()
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error: any) {
    console.error("Error creating trending product:", error)
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 })
  }
}
