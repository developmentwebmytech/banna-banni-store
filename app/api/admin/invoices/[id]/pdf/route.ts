import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import Invoice from "@/app/lib/models/invoice"
import mongoose from "mongoose"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 })
    }

    const invoice = await Invoice.findById(params.id).populate(
      "wholesalerId",
      "name city contactNumbers address gstNumber",
    )

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Generate PDF content (HTML that can be converted to PDF)
    const pdfContent = generateInvoicePDF(invoice)

    return new NextResponse(pdfContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

function generateInvoicePDF(invoice: any) {
  const wholesaler = invoice.wholesalerId
  const date = new Date(invoice.purchaseDate).toLocaleDateString("en-IN")

  const gstAmount = (invoice.grossAmount * invoice.gstPercentage) / 100

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .company-info { margin-bottom: 20px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>INVOICE</h1>
        </div>
        
        <div class="invoice-info">
            <div>
                <h3>Bill To:</h3>
                <p><strong>${wholesaler?.name || "Unknown Wholesaler"}</strong></p>
                <p>${wholesaler?.address || ""}</p>
                <p>${wholesaler?.city || ""}</p>
                <p>Contact: ${wholesaler?.contactNumbers?.[0] || "N/A"}</p>
                ${wholesaler?.gstNumber ? `<p>GST: ${wholesaler.gstNumber}</p>` : ""}
            </div>
            <div>
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Financial Year:</strong> ${invoice.financialYear}</p>
            </div>
        </div>

        ${invoice.description ? `<div class="invoice-details"><p><strong>Description:</strong> ${invoice.description}</p></div>` : ""}

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Gross Amount</td>
                    <td>₹${invoice.grossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>GST ${invoice.gstPercentage}%</td>
                    <td>₹${gstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>Other Cost</td>
                    <td>₹${invoice.otherCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>Discount</td>
                    <td>-₹${invoice.discount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Amount</strong></td>
                    <td><strong>₹${invoice.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 40px;">
            <p><strong>Terms & Conditions:</strong></p>
            <ul>
                <li>Payment due within 30 days</li>
                <li>All prices are in Indian Rupees</li>
                <li>This is a computer generated invoice</li>
            </ul>
        </div>

        <div style="margin-top: 40px; text-align: center;">
            <p>Thank you for your business!</p>
        </div>
    </body>
    </html>
  `
}
