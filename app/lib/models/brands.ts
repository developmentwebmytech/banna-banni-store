import mongoose, { Schema, type Document } from "mongoose"

// Brand Interface
interface IBrand extends Document {
  name: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}
// Brand Schema
const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, default: null },
  },
  { timestamps: true },
)

export const Brand = mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema)
export type {  IBrand }