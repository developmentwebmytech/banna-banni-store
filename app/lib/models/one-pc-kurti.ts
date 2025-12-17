import mongoose from "mongoose"

export interface IOnePcKurti extends mongoose.Document {
  parentProductId?: string // Parent product reference
  financialYear: string
  wholesalerId: mongoose.Schema.Types.ObjectId // Reference to Wholesaler model
  kurtiFabricType: string
  work: string
  bustSize: string // e.g., "32", "34", "Custom"
  kurtiLength: string // e.g., "Short", "Knee-length", "Ankle-length", "Custom"
  sleeveLength: string // e.g., "Short", "Elbow", "Full", "Sleeveless", "Custom"
  kurtiManufacturer: string
  quantity: number
  updatedAt: Date
}

const onePcKurtiSchema = new mongoose.Schema<IOnePcKurti>(
  {
    parentProductId: { type: String }, // Parent product ID
    financialYear: { type: String, required: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
    kurtiFabricType: { type: String, required: true },
    work: { type: String, required: true },
    bustSize: { type: String, required: true },
    kurtiLength: { type: String, required: true },
    sleeveLength: { type: String, required: true },
    kurtiManufacturer: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

// Add index for faster queries
onePcKurtiSchema.index({ parentProductId: 1 })

export const OnePcKurti = mongoose.models.OnePcKurti || mongoose.model<IOnePcKurti>("OnePcKurti", onePcKurtiSchema)
