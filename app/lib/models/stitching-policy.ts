import mongoose from "mongoose"

export interface IStitchingPolicy extends mongoose.Document {
  title: string
  description: string
  updatedAt: Date
}

const stitchingPolicySchema = new mongoose.Schema<IStitchingPolicy>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
)

export const StitchingPolicy =
  mongoose.models.StitchingPolicy || mongoose.model<IStitchingPolicy>("StitchingPolicy", stitchingPolicySchema)
