import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import Invoice from "@/app/lib/models/invoice"

export async function GET() {
  try {
    await connectDB()

    const invoices = await Invoice.find({})
      .populate("wholesalerId", "name city contactNumbers gstNumber")
      .sort({ createdAt: -1 })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
      autoGenerate,
    } = body

    let finalInvoiceNumber = invoiceNumber

    if (autoGenerate) {
      // Get the current year from financial year (e.g., "2024-25" -> "24")
      const yearSuffix = financialYear.split("-")[0].slice(-2)

      // Find the highest invoice number for this financial year
      const lastInvoice = await Invoice.findOne({
        financialYear,
        invoiceNumber: { $regex: `^Y${yearSuffix}` },
      }).sort({ invoiceNumber: -1 })

      let nextNumber = 1
      if (lastInvoice) {
        // Extract number from invoice like "Y24001" -> 1
        const lastNumber = Number.parseInt(lastInvoice.invoiceNumber.slice(3))
        nextNumber = lastNumber + 1
      }

      // Generate invoice number like "Y24001", "Y24002", etc.
      finalInvoiceNumber = `Y${yearSuffix}${nextNumber.toString().padStart(3, "0")}`
    }

    const gstAmount = (grossAmount * gstPercentage) / 100
    const totalAmount = grossAmount + gstAmount + otherCost - discount

    const invoice = new Invoice({
      invoiceNumber: finalInvoiceNumber,
      wholesalerId,
      purchaseDate,
      grossAmount,
      gstPercentage,
      otherCost,
      discount,
      description,
      financialYear,
      totalAmount,
    })

    await invoice.save()
    await invoice.populate("wholesalerId", "name city contactNumbers gstNumber")

    return NextResponse.json(invoice, { status: 201 })
  } catch (error: any) {
    console.error("Error creating invoice:", error)

    if (error.code === 11000) {
      return NextResponse.json({ error: "Invoice number already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
