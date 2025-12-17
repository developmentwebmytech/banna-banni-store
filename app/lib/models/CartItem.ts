import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem extends Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
  userId: string; // assuming you identify user by some string ID
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  userId: { type: String, required: true },
});

export const CartItem: Model<ICartItem> =
  mongoose.models.CartItem || mongoose.model("CartItem", CartItemSchema);
