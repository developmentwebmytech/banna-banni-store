import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { PetticoatKurti } from "@/app/lib/models/petticoat-kurti"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB()

  const body = await req.json()
  const kurtiData = {
    ...body,
    parentProductId: params.id,
  }

  const kurti = await PetticoatKurti.create(kurtiData)
  return NextResponse.json(kurti, { status: 201 })
}
