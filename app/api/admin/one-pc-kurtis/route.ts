import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { OnePcKurti } from "@/app/lib/models/one-pc-kurti"

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const parentId = searchParams.get("parentId")

    console.log(`Fetching one-pc kurtis with parentId: ${parentId}`)

    let query = {}
    if (parentId) {
      query = { parentProductId: parentId }
    }

    const kurtis = await OnePcKurti.find(query).populate("wholesalerId", "name").sort({ updatedAt: -1 }).lean()

    console.log(`Found ${kurtis.length} one-pc kurtis`)

    // Convert ObjectIds to strings
    const kurtisData = kurtis.map((kurti) => ({
      ...kurti,
      _id: kurti._id.toString(),
      wholesalerId: kurti.wholesalerId
        ? {
            ...kurti.wholesalerId,
            _id: kurti.wholesalerId._id.toString(),
          }
        : null,
    }))

    return NextResponse.json(kurtisData)
  } catch (error) {
    console.error("Error fetching one-pc kurtis:", error)
    return NextResponse.json({ error: "Failed to fetch one-pc kurtis" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const kurti = await OnePcKurti.create(body)
    return NextResponse.json(kurti, { status: 201 })
  } catch (error) {
    console.error("Error creating one-pc kurti:", error)
    return NextResponse.json({ error: "Failed to create one-pc kurti" }, { status: 500 })
  }
}
