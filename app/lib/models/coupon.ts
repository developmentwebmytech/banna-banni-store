import { Schema, type Document, models, model } from "mongoose"
import slugify from "slugify"

// Define the interface
export interface ICoupon extends Document {
  code: string
  description?: string
  discountType: "percentage" | "flat"
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  expiresAt?: Date
  isActive: boolean
  slug: string
  createdAt?: Date
}

// Define the schema
const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number },
    maxDiscount: { type: Number },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
)

// Auto-generate slug from code before saving
CouponSchema.pre("validate", function (next) {
  // Ensure 'this.code' is a string before attempting to slugify
  if (!this.slug && typeof this.code === "string" && this.code.length > 0) {
    this.slug = slugify(this.code, { lower: true, strict: true })
  }
  next()
})

// Avoid recompilation
const Coupon = models.Coupon || model<ICoupon>("Coupon", CouponSchema)
export default Coupon
