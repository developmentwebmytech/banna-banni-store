import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import Testimonial from "@/app/lib/models/testimonial"

export async function GET() {
  await connectDB()
  try {
    const testimonials = await Testimonial.find({})
    return NextResponse.json(testimonials, { status: 200 })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}
