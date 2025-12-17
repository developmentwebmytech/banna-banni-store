import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Blouse } from "@/app/lib/models/blouse"

export async function GET(_: any, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const blouse = await Blouse.findById(id).populate("wholesalerId", "name")
  return NextResponse.json(blouse)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await req.json()
  const blouse = await Blouse.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(blouse)
}

export async function DELETE(_: any, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await Blouse.findByIdAndDelete(id)
  return NextResponse.json({ message: "Deleted" })
}
