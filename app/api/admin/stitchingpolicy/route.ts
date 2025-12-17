import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { StitchingPolicy } from "@/app/lib/models/stitching-policy"

export async function GET() {
  await connectDB()
  const policies = await StitchingPolicy.find().sort({ updatedAt: -1 })
  return NextResponse.json(policies)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const policy = await StitchingPolicy.create(body)
  return NextResponse.json(policy, { status: 201 })
}
