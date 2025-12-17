import mongoose, { type Document, Schema } from "mongoose"

export interface IAddress extends Document {
  _id: string
  userId: string
  address: string
  city: string
  state: string
  zipcode: string
  country: string
  countryCode: string
  mobileNumber: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipcode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      default: "+91",
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better performance
AddressSchema.index({ userId: 1 })
AddressSchema.index({ userId: 1, isDefault: 1 })

// Ensure only one default address per user
AddressSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    await mongoose.model("Address").updateMany({ userId: this.userId, _id: { $ne: this._id } }, { isDefault: false })
  }
  next()
})

export const Address = mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema)
