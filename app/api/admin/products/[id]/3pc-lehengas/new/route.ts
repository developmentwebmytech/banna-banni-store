import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ThreePcLehenga } from "@/app/lib/models/3pc-lehenga"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    // Add the parent product ID to the lehenga data
    const lehengaData = {
      ...body,
      parentProductId: id,
    }

    const lehenga = await ThreePcLehenga.create(lehengaData)
    return NextResponse.json(lehenga, { status: 201 })
  } catch (error) {
    console.error("Error creating 3pc lehenga:", error)
    return NextResponse.json({ error: "Failed to create 3pc lehenga" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // Get all 3pc lehengas for this product
    const lehengas = await ThreePcLehenga.find({ parentProductId: id })
      .populate("wholesalerId", "name")
      .sort({ updatedAt: -1 })

    return NextResponse.json(lehengas)
  } catch (error) {
    console.error("Error fetching 3pc lehengas:", error)
    return NextResponse.json({ error: "Failed to fetch 3pc lehengas" }, { status: 500 })
  }
}
