import { Schema, type Document, model, models } from "mongoose"

// TypeScript Interface
export interface ITopProduct extends Document {
  tag: string // E.g., "Top Rated", "Limited Offer"
  image: string // Image path or URL
  title: string // Product name/title
  price: string // Current price (e.g., "₹135")
  mrp: string // Original price
  off: string // Discount (e.g., "25% off")
  slug: string // URL-friendly version of title
  description?: string // Product description
  features?: string[] // Product features
  category?: string // Product category
  stock?: number // Available stock
  createdAt?: Date
  updatedAt?: Date
}

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

// Schema Definition
const TopProductSchema: Schema = new Schema(
  {
    tag: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    mrp: { type: String, required: true },
    off: { type: String, required: true },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: { type: String, default: "" },
    features: [{ type: String }],
    category: { type: String, default: "Top Products" },
    stock: { type: Number, default: 10 },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
)

// Pre-save middleware to generate slug
TopProductSchema.pre("save", function (next) {
  // Ensure 'this.title' is a string before attempting to generate slug
  if ((this.isModified("title") || !this.slug) && typeof this.title === "string" && this.title.length > 0) {
    this.slug = generateSlug(this.title)
  }
  next()
})

// Model Export
const TopProduct = models.TopProduct || model<ITopProduct>("TopProduct", TopProductSchema)
export default TopProduct
