import { Schema, type Document, models, model } from "mongoose"
import slugify from "slugify"

export interface IBestSellerVariation {
  color: string
  size: string
  stock: number
  sku?: string
}

export interface IBestSellerProduct extends Document {
  images: string[]
  title: string
  description: string
  category: string
  price: number
  mrp: number
  discount: string
  ratings: number
  slug: string
  variations: IBestSellerVariation[]
  createdAt?: Date
  updatedAt?: Date
}

const BestSellerVariationSchema: Schema = new Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String },
})

const BestSellerProductSchema: Schema = new Schema(
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
    variations: [BestSellerVariationSchema],
  },
  {
    timestamps: true,
  },
)

BestSellerProductSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    // Type assertion to tell TypeScript that this.title is a string
    this.slug = slugify(this.title as string, { lower: true, strict: true })
  }
  next()
})

const BestSellerProduct =
  models.BestSellerProduct || model<IBestSellerProduct>("BestSellerProduct", BestSellerProductSchema)

export default BestSellerProduct
