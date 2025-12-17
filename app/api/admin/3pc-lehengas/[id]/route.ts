import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { ThreePcLehenga } from "@/app/lib/models/3pc-lehenga"

export async function GET(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  const lehenga = await ThreePcLehenga.findById(params.id).populate("wholesalerId", "name")
  return NextResponse.json(lehenga)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  // Ensure only allowed fields are updated
  const updatePayload = {
    financialYear: body.financialYear,
    wholesalerId: body.wholesalerId,
    designCode: body.designCode,
    designName: body.designName,
    lehngaType: body.lehngaType,
    blouseStitching: body.blouseStitching,
    skirtStitching: body.skirtStitching,
    fabricType: body.fabricType,
    blouseFabric: body.blouseFabric,
    skirtFabric: body.skirtFabric,
    dupattaFabric: body.dupattaFabric,
    workAndPrint: body.workAndPrint,
    lehengaManufacturer: body.lehengaManufacturer,
    hasKenken: body.hasKenken,
    quantity: body.quantity,
  }
  const lehenga = await ThreePcLehenga.findByIdAndUpdate(params.id, updatePayload, { new: true })
  return NextResponse.json(lehenga)
}

export async function DELETE(_: any, { params }: { params: { id: string } }) {
  await connectDB()
  await ThreePcLehenga.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
