import mongoose from "mongoose"

export interface I3pcLehenga extends mongoose.Document {
  financialYear: string
  wholesalerId: mongoose.Schema.Types.ObjectId
  designCode: string
  designName: string
  lehngaType: string
  blouseStitching: string
  skirtStitching: string
  fabricType: string
  blouseFabric: string
  skirtFabric: string
  dupattaFabric: string
  workAndPrint: string
  lehengaManufacturer: string
  hasKenken: boolean
  quantity: number
  parentProductId?: string // Parent product reference
  updatedAt: Date
}

const threePcLehengaSchema = new mongoose.Schema<I3pcLehenga>(
  {
    financialYear: { type: String, required: true },
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true },
    designCode: { type: String, required: true },
    designName: { type: String, required: true },
    lehngaType: { type: String, required: true },
    blouseStitching: { type: String, required: true },
    skirtStitching: { type: String, required: true },
    fabricType: { type: String, required: true },
    blouseFabric: { type: String, required: true },
    skirtFabric: { type: String, required: true },
    dupattaFabric: { type: String, required: true },
    workAndPrint: { type: String, required: true },
    lehengaManufacturer: { type: String, required: true },
    hasKenken: { type: Boolean, default: false },
    quantity: { type: Number, required: true },
    parentProductId: { type: String }, // Parent product ID
  },
  { timestamps: true },
)

export const ThreePcLehenga =
  mongoose.models.ThreePcLehenga || mongoose.model<I3pcLehenga>("ThreePcLehenga", threePcLehengaSchema)
