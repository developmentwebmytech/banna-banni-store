import { Schema, type Document, model, models } from "mongoose"

// TypeScript Interface
export interface IHeaderCategory extends Document {
  name: string
  slug: string
  title: string
  description?: string
  images: Array<{
    url: string
    categoryName: string
  }>
  icon?: string
  color?: string
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
const HeaderCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    images: [
      {
        url: { type: String, required: true },
        categoryName: { type: String, required: true },
      },
    ],
    icon: { type: String, default: "" },
    color: { type: String, default: "#3B82F6" }, // Default blue color
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
)

// Pre-save middleware to generate slug
HeaderCategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name as string)
  }
  next()
})

if (models.HeaderCategory) {
  delete models.HeaderCategory
}

// Model Export with forced recreation
const HeaderCategory = model<IHeaderCategory>("HeaderCategory", HeaderCategorySchema)
export default HeaderCategory
