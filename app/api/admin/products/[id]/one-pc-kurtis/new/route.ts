import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { OnePcKurti } from "@/app/lib/models/one-pc-kurti"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    // Add the parent product ID to the kurti data
    const kurtiData = {
      ...body,
      parentProductId: id,
    }

    const kurti = await OnePcKurti.create(kurtiData)
    return NextResponse.json(kurti, { status: 201 })
  } catch (error) {
    console.error("Error creating one-pc kurti:", error)
    return NextResponse.json({ error: "Failed to create one-pc kurti" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // Get all one-pc kurtis for this product
    const kurtis = await OnePcKurti.find({ parentProductId: id })
      .populate("wholesalerId", "name")
      .sort({ updatedAt: -1 })

    return NextResponse.json(kurtis)
  } catch (error) {
    console.error("Error fetching one-pc kurtis:", error)
    return NextResponse.json({ error: "Failed to fetch one-pc kurtis" }, { status: 500 })
  }
}
