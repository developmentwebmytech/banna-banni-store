import mongoose from "mongoose"

export interface IBlouse extends mongoose.Document {
  parentProductId?: string // Parent product reference
  financialYear: string
  wholesalerId: mongoose.Schema.Types.ObjectId // Reference to Wholesaler model
  fabricType: string
  workAndPrint: string
  bustSize: string // e.g., "32", "34", "Custom"
  blouseLength: string // e.g., "14 inches", "Custom"
  sleeveLength: string // e.g., "Short", "Elbow", "Full", "Custom"
  blouseManufacturer: string
  quantity: number
  updatedAt: Date
}

const blouseSchema = new mongoose.Schema<IBlouse>(
  {
    parentProductId: { type: String }, // Parent product ID
    financialYear: { type: String, required: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
    fabricType: { type: String, required: true },
    workAndPrint: { type: String, required: true },
    bustSize: { type: String, required: true },
    blouseLength: { type: String, required: true },
    sleeveLength: { type: String, required: true },
    blouseManufacturer: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

export const Blouse = mongoose.models.Blouse || mongoose.model<IBlouse>("Blouse", blouseSchema)
