import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { PetticoatKurti } from "@/app/lib/models/petticoat-kurti"

export async function GET(request: Request) {
  await connectDB()

  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get("parentId")

  let query = {}
  if (parentId) {
    query = { parentProductId: parentId }
  }

  const kurtis = await PetticoatKurti.find(query).populate("wholesalerId", "name").sort({ updatedAt: -1 })
  return NextResponse.json(kurtis)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const kurti = await PetticoatKurti.create(body)
  return NextResponse.json(kurti, { status: 201 })
}
