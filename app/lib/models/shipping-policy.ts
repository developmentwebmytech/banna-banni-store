import mongoose from "mongoose"

export interface IShippingPolicy extends mongoose.Document {
  title: string
  description: string
  updatedAt: Date
}

const shippingPolicySchema = new mongoose.Schema<IShippingPolicy>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
)

export const ShippingPolicy =
  mongoose.models.ShippingPolicy || mongoose.model<IShippingPolicy>("ShippingPolicy", shippingPolicySchema)
