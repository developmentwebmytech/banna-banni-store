import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ThreePcKurti } from "@/app/lib/models/three-pc-kurti"

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  const kurti = await ThreePcKurti.findById(params.id).populate("wholesalerId", "name")
  return NextResponse.json(kurti)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const kurti = await ThreePcKurti.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(kurti)
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  await ThreePcKurti.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
