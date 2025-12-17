import mongoose from "mongoose"

export interface IThreePcKurti extends mongoose.Document {
  financialYear: string
  wholesalerId: mongoose.Schema.Types.ObjectId // Reference to Wholesaler model
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
  dupattaLength: string // e.g., "2.25 meters", "Custom"
  dupattaWidth: string // e.g., "1 meter", "Custom"
  kurtiManufacturer: string
  quantity: number
  parentProductId?: mongoose.Schema.Types.ObjectId // Reference to Product model (optional)
  updatedAt: Date
}

const threePcKurtiSchema = new mongoose.Schema<IThreePcKurti>(
  {
    financialYear: { type: String, required: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
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
    dupattaLength: { type: String, required: true },
    dupattaWidth: { type: String, required: true },
    kurtiManufacturer: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    parentProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
  },
  { timestamps: true },
)

export const ThreePcKurti =
  mongoose.models.ThreePcKurti || mongoose.model<IThreePcKurti>("ThreePcKurti", threePcKurtiSchema)
