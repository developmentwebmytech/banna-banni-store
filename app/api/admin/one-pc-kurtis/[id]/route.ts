import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { OnePcKurti } from "@/app/lib/models/one-pc-kurti"

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  const kurti = await OnePcKurti.findById(params.id).populate("wholesalerId", "name")
  return NextResponse.json(kurti)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const kurti = await OnePcKurti.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(kurti)
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  await OnePcKurti.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
