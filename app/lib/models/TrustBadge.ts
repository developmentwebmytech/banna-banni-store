import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ITrustBadge extends Document {
  src: string;
  alt: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TrustBadgeSchema: Schema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const TrustBadge = models.TrustBadge || model<ITrustBadge>("TrustBadge", TrustBadgeSchema);
export default TrustBadge;
