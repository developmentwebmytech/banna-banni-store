import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import BestSellerProduct from "@/app/lib/models/bestseller"

export async function GET() {
  await connectDB()
  try {
    const products = await BestSellerProduct.find({})
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching admin best seller products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectDB()
  try {
    const body = await request.json()
    const newProduct = new BestSellerProduct(body)
    await newProduct.save()
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error: any) {
    console.error("Error creating best seller product:", error)
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 })
  }
}
