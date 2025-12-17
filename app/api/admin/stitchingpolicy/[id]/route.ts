import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { StitchingPolicy } from "@/app/lib/models/stitching-policy"

export async function GET(_: any, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const policy = await StitchingPolicy.findById(id)
  return NextResponse.json(policy)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await req.json()
  const policy = await StitchingPolicy.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(policy)
}

export async function DELETE(_: any, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await StitchingPolicy.findByIdAndDelete(id)
  return NextResponse.json({ message: "Deleted" })
}
