import { Schema, type Document, models, model } from "mongoose"
import slugify from "slugify"

export interface IShopByCategoryProduct extends Document {
  images: string[] // Changed from 'img' to 'images' to support multiple
  title: string
  description: string
  category: string
  price: number
  mrp: number
  discount: string // e.g., "75%"
  ratings: number // e.g., 4.5
  slug: string
  // For Shop By Category, we might not need variations directly on the category itself,
  // but if each category item is a product, it would have variations.
  // For simplicity, I'll keep the structure similar to products for now,
  // assuming each "category item" is treated like a product.
  variations: {
    color: string
    size: string
    stock: number
    sku?: string
  }[]
  createdAt?: Date
  updatedAt?: Date
}

const ShopByCategoryVariationSchema: Schema = new Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String },
})

const ShopByCategoryProductSchema: Schema = new Schema(
  {
    images: [{ type: String }], // Array of image URLs
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // This will be the category name itself
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: String, required: true },
    ratings: { type: Number, required: true, default: 0 },
    slug: { type: String, required: true, unique: true },
    variations: [ShopByCategoryVariationSchema], // Array of variation objects
  },
  {
    timestamps: true,
  },
)

ShopByCategoryProductSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title as string, { lower: true, strict: true })
  }
  next()
})

const ShopByCategoryProduct =
  models.ShopByCategoryProduct || model<IShopByCategoryProduct>("ShopByCategoryProduct", ShopByCategoryProductSchema)

export default ShopByCategoryProduct
