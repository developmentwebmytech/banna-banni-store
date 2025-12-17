import { Schema, type Document, models, model } from "mongoose"
import slugify from "slugify"

export interface ITrendingVariation {
  color: string
  size: string
  stock: number
  sku?: string
}

export interface ITrendingProduct extends Document {
  images: string[]
  title: string
  description: string
  category: string
  price: number
  mrp: number
  discount: string
  ratings: number
  slug: string
  variations: ITrendingVariation[]
  createdAt?: Date
  updatedAt?: Date
}

const TrendingVariationSchema: Schema = new Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String },
})

const TrendingProductSchema: Schema = new Schema(
  {
    images: [{ type: String }],
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: String, required: true },
    ratings: { type: Number, required: true, default: 0 },
    slug: { type: String, required: true, unique: true },
    variations: [TrendingVariationSchema],
  },
  {
    timestamps: true,
  },
)

TrendingProductSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title as string, { lower: true, strict: true })
  }
  next()
})

const TrendingProduct = models.TrendingProduct || model<ITrendingProduct>("TrendingProduct", TrendingProductSchema)

export default TrendingProduct
