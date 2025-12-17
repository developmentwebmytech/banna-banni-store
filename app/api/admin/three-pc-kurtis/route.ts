import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ThreePcKurti } from "@/app/lib/models/three-pc-kurti"

export async function GET(req: Request) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const parentId = searchParams.get("parentId")

  let query = {}
  if (parentId) {
    query = { parentProductId: parentId }
  }

  const kurtis = await ThreePcKurti.find(query).populate("wholesalerId", "name").sort({ updatedAt: -1 })
  return NextResponse.json(kurtis)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const kurti = await ThreePcKurti.create(body)
  return NextResponse.json(kurti, { status: 201 })
}
