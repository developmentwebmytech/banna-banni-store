import { Schema, type Document, model, models } from "mongoose"

export interface IBanner extends Document {
  image: string // Banner image path or URL
  link?: string // Optional link URL for the banner
  createdAt?: Date
  updatedAt?: Date
}

const BannerSchema: Schema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
      default: null, // Explicitly set default to null
    },
  },
  {
    timestamps: true,
  },
)

// Clear any existing model to avoid conflicts
if (models.Banner) {
  delete models.Banner
}

const Banner = model<IBanner>("Banner", BannerSchema)
export default Banner
