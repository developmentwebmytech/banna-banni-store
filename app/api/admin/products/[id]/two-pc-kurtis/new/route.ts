import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { TwoPcKurti } from "@/app/lib/models/two-pc-kurti"

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

    const kurti = await TwoPcKurti.create(kurtiData)
    const populatedKurti = await TwoPcKurti.findById(kurti._id).populate("wholesalerId", "name")

    return NextResponse.json(populatedKurti, { status: 201 })
  } catch (error) {
    console.error("Error creating two-pc kurti:", error)
    return NextResponse.json({ error: "Failed to create two-pc kurti" }, { status: 500 })
  }
}
