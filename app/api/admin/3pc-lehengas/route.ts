import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ThreePcLehenga } from "@/app/lib/models/3pc-lehenga"

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const lehenga = await ThreePcLehenga.create(body)
    return NextResponse.json(lehenga, { status: 201 })
  } catch (error) {
    console.error("Error creating 3pc lehenga:", error)
    return NextResponse.json({ error: "Failed to create 3pc lehenga" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const parentId = searchParams.get("parentId")

    let query = {}
    if (parentId) {
      query = { parentProductId: parentId }
    }

    const lehengas = await ThreePcLehenga.find(query).populate("wholesalerId", "name").sort({ updatedAt: -1 })

    return NextResponse.json(lehengas)
  } catch (error) {
    console.error("Error fetching 3pc lehengas:", error)
    return NextResponse.json({ error: "Failed to fetch 3pc lehengas" }, { status: 500 })
  }
}
