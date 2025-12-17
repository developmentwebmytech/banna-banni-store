import { Schema, type Document, models, model } from "mongoose"
import slugify from "slugify"

export interface IBlog extends Document {
  title: string
  description: string
  image: string // URL for blog post's main image
  content: string // Full HTML or Markdown content of the blog
  slug: string
  createdAt?: Date
  updatedAt?: Date
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
)

BlogSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title as string, { lower: true, strict: true })
  }
  next()
})

const Blog = models.Blog || model<IBlog>("Blog", BlogSchema)

export default Blog
