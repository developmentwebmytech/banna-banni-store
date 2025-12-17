import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ShippingPolicy } from "@/app/lib/models/shipping-policy"

export async function GET() {
  await connectDB()
  const policies = await ShippingPolicy.find().sort({ updatedAt: -1 })
  return NextResponse.json(policies)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const policy = await ShippingPolicy.create(body)
  return NextResponse.json(policy, { status: 201 })
}
