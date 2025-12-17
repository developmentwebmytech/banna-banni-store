import { Schema, type Document, models, model } from "mongoose"

export interface IVideo {
  url: string
  poster: string
}

export interface IAboutUs extends Document {
  title?: string // Made optional again
  description?: string // Made optional again
  videos: IVideo[]
  createdAt?: Date
  updatedAt?: Date
}

const VideoSchema: Schema = new Schema({
  url: { type: String, required: true },
  poster: { type: String, required: true },
})

const AboutUsSchema: Schema = new Schema(
  {
    title: { type: String, required: false }, // Changed to false
    description: { type: String, required: false }, // Changed to false
    videos: [VideoSchema],
  },
  {
    timestamps: true,
  },
)

const AboutUs = models.AboutUs || model<IAboutUs>("AboutUs", AboutUsSchema)

export default AboutUs
