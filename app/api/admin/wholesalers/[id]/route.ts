import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Wholesaler } from "@/app/lib/models/wholesaler"
import { validateWholesaler } from "@/app/lib/validations/wholesaler"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const wholesaler = await Wholesaler.findById(params.id)

  if (!wholesaler) {
    return NextResponse.json({ error: "Wholesaler not found" }, { status: 404 })
  }

  return NextResponse.json(wholesaler)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  await Wholesaler.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()

  const validationErrors = validateWholesaler(body)
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors[0].message }, { status: 400 })
  }

  try {
    const wholesaler = await Wholesaler.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json(wholesaler)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update wholesaler" }, { status: 400 })
  }
}
