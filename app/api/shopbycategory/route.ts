import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import ShopByCategoryProduct from "@/app/lib/models/shopbycategory"

export async function GET() {
  await connectDB()
  try {
    const products = await ShopByCategoryProduct.find({})
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching shop by category products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
