import mongoose from "mongoose"

export interface IPetticoatKurti extends mongoose.Document {
  financialYear: string
  wholesalerId: mongoose.Schema.Types.ObjectId // Reference to Wholesaler model
  petticoatFabricType: string
  work: string
  waistSize: string // e.g., "28", "30", "Elastic", "Custom"
  petticoatLength: string // e.g., "36 inches", "38 inches", "Custom"
  manufacturer: string
  quantity: number
  parentProductId?: mongoose.Schema.Types.ObjectId // Reference to Product model
  updatedAt: Date
}

const petticoatKurtiSchema = new mongoose.Schema<IPetticoatKurti>(
  {
    financialYear: { type: String, required: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
    petticoatFabricType: { type: String, required: true },
    work: { type: String, required: true },
    waistSize: { type: String, required: true },
    petticoatLength: { type: String, required: true },
    manufacturer: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    parentProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
  },
  { timestamps: true },
)

export const PetticoatKurti =
  mongoose.models.PetticoatKurti || mongoose.model<IPetticoatKurti>("PetticoatKurti", petticoatKurtiSchema)
