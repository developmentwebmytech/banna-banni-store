import mongoose, { Schema, Document, model, models } from "mongoose"

export interface IFeature extends Document {
  title: string
  subtitle: string
  icon: string
  bg: string
  href: string
  createdAt?: Date
  updatedAt?: Date
}

const FeatureSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    icon: { type: String, required: true }, // URL or path to the image/icon
    bg: { type: String, required: true }, // Tailwind color class or hex
    href: { type: String, required: true }, // Internal or external link
  },
  {
    timestamps: true,
  }
)

const Feature = models.Feature || model<IFeature>("Feature", FeatureSchema)
export default Feature
