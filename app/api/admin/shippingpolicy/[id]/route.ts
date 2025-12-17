import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ShippingPolicy } from "@/app/lib/models/shipping-policy"

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  const policy = await ShippingPolicy.findById(params.id)
  return NextResponse.json(policy)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const policy = await ShippingPolicy.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(policy)
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  await ShippingPolicy.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
