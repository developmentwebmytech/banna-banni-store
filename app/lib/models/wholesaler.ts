import mongoose from "mongoose"

export interface IWholesaler extends mongoose.Document {
  name: string
  gstNumber?: string
  area?: string
  city?: string
  state?: string
  contactNumbers?: string[]
  email?: string
  website?: string
  address?: string
  pincode?: string
  productsPurchased?: string[]
  updatedAt: Date
}

const wholesalerSchema = new mongoose.Schema<IWholesaler>(
  {
    name: { type: String, required: true },
    gstNumber: { type: String },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    contactNumbers: [{ type: String }],
    email: { type: String },
    website: { type: String },
    address: { type: String },
    pincode: { type: String },
    productsPurchased: [{ type: String }],
  },
  { timestamps: true },
)

export const Wholesaler = mongoose.models.Wholesaler || mongoose.model<IWholesaler>("Wholesaler", wholesalerSchema)
