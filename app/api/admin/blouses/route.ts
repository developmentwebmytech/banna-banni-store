import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Blouse } from "@/app/lib/models/blouse"

export async function GET(req: Request) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const parentId = searchParams.get("parentId")

  let query = {}
  if (parentId) {
    query = { parentProductId: parentId }
  }

  const blouses = await Blouse.find(query).populate("wholesalerId", "name").sort({ updatedAt: -1 })
  return NextResponse.json(blouses)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const blouse = await Blouse.create(body)
  return NextResponse.json(blouse, { status: 201 })
}
