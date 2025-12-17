import mongoose from "mongoose"

export interface ITwoPcKurti extends mongoose.Document {
  financialYear: string
  wholesalerId: mongoose.Schema.Types.ObjectId // Reference to Wholesaler model
  parentProductId?: mongoose.Schema.Types.ObjectId // Reference to Product model
  kurtiFabricType: string
  pattern: string
  work: string
  bustSize: string // e.g., "32", "34", "Custom"
  kurtiLength: string // e.g., "Short", "Knee-length", "Ankle-length", "Custom"
  sleeveLength: string // e.g., "Short", "Elbow", "Full", "Sleeveless", "Custom"
  pantLength: string // e.g., "38 inches", "Custom"
  pantWaistSize: string // e.g., "28", "30", "Elastic", "Custom"
  pantHipSize: string // e.g., "36", "38", "Custom"
  stretchable: boolean
  kurtiManufacturer: string
  quantity: number
  updatedAt: Date
}

const twoPcKurtiSchema = new mongoose.Schema<ITwoPcKurti>(
  {
    financialYear: { type: String, required: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
    parentProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    kurtiFabricType: { type: String, required: true },
    pattern: { type: String, required: true },
    work: { type: String, required: true },
    bustSize: { type: String, required: true },
    kurtiLength: { type: String, required: true },
    sleeveLength: { type: String, required: true },
    pantLength: { type: String, required: true },
    pantWaistSize: { type: String, required: true },
    pantHipSize: { type: String, required: true },
    stretchable: { type: Boolean, default: false },
    kurtiManufacturer: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

export const TwoPcKurti = mongoose.models.TwoPcKurti || mongoose.model<ITwoPcKurti>("TwoPcKurti", twoPcKurtiSchema)
