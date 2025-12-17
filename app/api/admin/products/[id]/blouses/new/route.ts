import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Blouse } from "@/app/lib/models/blouse"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    // Add the parent product ID to the blouse data
    const blouseData = {
      ...body,
      parentProductId: id,
    }

    const blouse = await Blouse.create(blouseData)
    return NextResponse.json(blouse, { status: 201 })
  } catch (error) {
    console.error("Error creating blouse:", error)
    return NextResponse.json({ error: "Failed to create blouse" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // Get all blouses for this product
    const blouses = await Blouse.find({ parentProductId: id }).populate("wholesalerId", "name").sort({ updatedAt: -1 })

    return NextResponse.json(blouses)
  } catch (error) {
    console.error("Error fetching blouses:", error)
    return NextResponse.json({ error: "Failed to fetch blouses" }, { status: 500 })
  }
}
