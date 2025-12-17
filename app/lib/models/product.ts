import mongoose, { Schema, type Document } from "mongoose";

// Product variation interface for Mongoose
interface IProductVariation {
  size: string;
  color: string;
  stock: number;
  price_modifier?: number;
}

// IProduct interface for Mongoose Document
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  purchased_price?: number;
  transport_cost?: number;
  other_cost?: number; // Added other_cost field
  gst?: string;
  discount_price?: number;
  discount_reason?: string;
  total_price?: number;
  status: "draft" | "live" | "offline";
  images: string[];
  category_id: mongoose.Types.ObjectId;
  brand_id: mongoose.Types.ObjectId;
  variations: IProductVariation[];
  slug: string;
  relatedProducts: mongoose.Types.ObjectId[];
  bestseller?: boolean;
  trending?: boolean;
  newarrival?: boolean;
  instagram_url?: string; // added optional instagram url
  createdAt: Date;
  updatedAt: Date;
}

// Product schema
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    oldPrice: { type: Number },
    discount: { type: String },
    rating: { type: Number },
    purchased_price: { type: Number },
    transport_cost: { type: Number },
    other_cost: { type: Number }, 
    gst: { type: String, default: "0%" },
    discount_price: { type: Number },
    discount_reason: { type: String },
    total_price: { type: Number },
    status: {
      type: String,
      enum: ["draft", "live", "offline"],
      default: "draft",
    },
    images: [{ type: String }],
    category_id: { type: Schema.Types.ObjectId, ref: "Category" },
    brand_id: { type: Schema.Types.ObjectId, ref: "Brand" },
    variations: [
      {
        size: { type: String },
        color: { type: String },
        stock: { type: Number, default: 0 },
        price_modifier: { type: Number, default: 0 },
      },
    ],
    slug: { type: String, unique: true },
    relatedProducts: [
      { type: Schema.Types.ObjectId, ref: "Product", default: [] },
    ],
    bestseller: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    newarrival: { type: Boolean, default: false },
    instagram_url: { type: String }, // added optional field in schema
  },
  { timestamps: true }
);

// Export Product model (safe for Next.js hot-reload)
const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
export const Product = ProductModel;
