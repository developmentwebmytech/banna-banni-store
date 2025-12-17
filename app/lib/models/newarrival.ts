import { Schema, type Document, models, model } from "mongoose"
import slugify from "slugify"

export interface IVariation {
  color: string
  size: string
  stock: number
  sku?: string
}

export interface INewArrivalProduct extends Document {
  images: string[] // Changed from 'img' to 'images' to support multiple
  title: string
  description: string
  category: string
  price: number
  mrp: number
  discount: string // e.g., "75%"
  ratings: number // e.g., 4.5
  slug: string
  variations: IVariation[]
  createdAt?: Date
  updatedAt?: Date
}

const VariationSchema: Schema = new Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String },
})

const NewArrivalProductSchema: Schema = new Schema(
  {
    images: [{ type: String }], // Array of image URLs
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: String, required: true },
    ratings: { type: Number, required: true, default: 0 },
    slug: { type: String, required: true, unique: true },
    variations: [VariationSchema], // Array of variation objects
  },
  {
    timestamps: true,
  },
)

NewArrivalProductSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title as string, { lower: true, strict: true })
  }
  next()
})

const NewArrivalProduct =
  models.NewArrivalProduct || model<INewArrivalProduct>("NewArrivalProduct", NewArrivalProductSchema)

export default NewArrivalProduct
