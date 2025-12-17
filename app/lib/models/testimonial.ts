import { Schema, type Document, models, model } from "mongoose"

export interface ITestimonial extends Document {
  name: string
  image: string // URL for reviewer's image
  rating: number // e.g., 4.5
  review: string
  sku?: string // Optional product SKU
  createdAt?: Date
  updatedAt?: Date
}

const TestimonialSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    review: { type: String, required: true },
    sku: { type: String },
  },
  {
    timestamps: true,
  },
)

const Testimonial = models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema)

export default Testimonial
