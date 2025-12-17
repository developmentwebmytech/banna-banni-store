import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import BestSellerProduct from "@/app/lib/models/bestseller"

export async function GET() {
  await connectDB()
  try {
    const products = await BestSellerProduct.find({})
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching best seller products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
