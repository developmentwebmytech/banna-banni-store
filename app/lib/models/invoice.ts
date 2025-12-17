import mongoose from "mongoose"

export interface IInvoice extends mongoose.Document {
  invoiceNumber: string
  wholesalerId: mongoose.Types.ObjectId
  purchaseDate: Date
  grossAmount: number
  gstPercentage: number
  otherCost: number
  discount: number
  description?: string
  financialYear: string
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

const invoiceSchema = new mongoose.Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
    purchaseDate: { type: Date, required: true },
    grossAmount: { type: Number, required: true, min: 0 },
    gstPercentage: { type: Number, required: true, min: 0, default: 18 },
    otherCost: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String },
    financialYear: { type: String, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true },
)

// Pre-save middleware to calculate total amount based on GST percentage
invoiceSchema.pre("save", function (next) {
  const gstAmount = (this.grossAmount * this.gstPercentage) / 100
  this.totalAmount = this.grossAmount + gstAmount + this.otherCost - this.discount
  next()
})

const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema)

export default Invoice
