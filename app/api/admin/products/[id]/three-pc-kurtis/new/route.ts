import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ThreePcKurti } from "@/app/lib/models/three-pc-kurti"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB()

  const body = await req.json()
  const productId = params.id

  // Add the parent product ID to the kurti data
  const kurtiData = {
    ...body,
    parentProductId: productId,
  }

  const kurti = await ThreePcKurti.create(kurtiData)
  return NextResponse.json(kurti, { status: 201 })
}
