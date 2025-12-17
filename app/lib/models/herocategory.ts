import { Schema, type Document, model, models } from "mongoose"

// TypeScript Interface
export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  image?: string
  isActive: boolean
  order: number
  createdAt?: Date
  updatedAt?: Date
}

// Function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

// Schema Definition
const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    color: { type: String, default: "#3B82F6" }, // Default blue color
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
)

// Pre-save middleware to generate slug
CategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name as string)
  }
  next()
})

// Model Export
const Category = models.Category || model<ICategory>("Category", CategorySchema)
export default Category
