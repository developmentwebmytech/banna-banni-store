import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import NewArrivalProduct from "@/app/lib/models/newarrival"

export async function GET() {
  try {
    await connectDB()

    const products = await NewArrivalProduct.find({}).lean() // Add lean() for performance

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching new arrival products:", error)
    return NextResponse.json(
      { error: "Failed to fetch new arrival products" },
      { status: 500 }
    )
  }
}
