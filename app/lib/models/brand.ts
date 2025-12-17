import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IBrand extends Document {
  name: string;
  image: string; // image URL or path
  bgColor: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    bgColor: { type: String, required: false }, // e.g., "bg-blue-700"
  },
  {
    timestamps: true,
  }
);

const Brand = models.Brand || model<IBrand>("Brand", BrandSchema);
export default Brand;
