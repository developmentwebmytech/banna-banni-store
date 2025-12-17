import mongoose, { Schema, type Document, type Model, type Types } from "mongoose"

export interface IUser extends Document {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  role: "user" | "admin" | "shopmanager" | "marketmanager"
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt?: Date
  updatedAt?: Date
  lastLogin?: Date
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user", "admin", "shopmanager", "marketmanager"] },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
