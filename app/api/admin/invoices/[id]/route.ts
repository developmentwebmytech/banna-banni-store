import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import Invoice from "@/app/lib/models/invoice"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const invoice = await Invoice.findById(params.id).populate("wholesalerId")

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      invoiceNumber,
      wholesalerId,
      purchaseDate,
      grossAmount,
      gstPercentage,
      otherCost,
      discount,
      description,
      financialYear,
    } = body

    const gstAmount = (grossAmount * gstPercentage) / 100
    const totalAmount = grossAmount + gstAmount + otherCost - discount

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      params.id,
      {
        invoiceNumber,
        wholesalerId,
        purchaseDate,
        grossAmount,
        gstPercentage,
        otherCost,
        discount,
        description,
        financialYear,
        totalAmount,
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("wholesalerId")

    if (!updatedInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const deletedInvoice = await Invoice.findByIdAndDelete(params.id)

    if (!deletedInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
