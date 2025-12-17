import mongoose, { Schema, type Document } from "mongoose";
import slugify from "slugify";

export interface ICategory extends Document {
  name: string;
  images: string;
  description: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    images: { type: String },
    description: { type: String },
    slug: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // prevents duplicate nulls from throwing errors
    },
  },
  {
    timestamps: true,
    strictPopulate: false,
  }
);

CategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
