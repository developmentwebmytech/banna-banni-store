import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import TrendingProduct from "@/app/lib/models/trending"

export async function GET() {
  await connectDB()
  try {
    const products = await TrendingProduct.find({})
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
