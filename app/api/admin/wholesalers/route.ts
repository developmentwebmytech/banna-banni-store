import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Wholesaler } from "@/app/lib/models/wholesaler"
import { validateWholesaler } from "@/app/lib/validations/wholesaler"

export async function GET() {
  await connectDB()
  const wholesalers = await Wholesaler.find().sort({ updatedAt: -1 })
  return NextResponse.json(wholesalers)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()

  const validationErrors = validateWholesaler(body)
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors[0].message }, { status: 400 })
  }

  try {
    const wholesaler = await Wholesaler.create(body)
    return NextResponse.json(wholesaler, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create wholesaler" }, { status: 400 })
  }
}
