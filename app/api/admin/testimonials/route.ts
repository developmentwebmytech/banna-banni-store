import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import Testimonial from "@/app/lib/models/testimonial"

export async function GET() {
  await connectDB()
  try {
    const testimonials = await Testimonial.find({})
    return NextResponse.json(testimonials, { status: 200 })
  } catch (error) {
    console.error("Error fetching admin testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectDB()
  try {
    const body = await request.json()
    const newTestimonial = new Testimonial(body)
    await newTestimonial.save()
    return NextResponse.json(newTestimonial, { status: 201 })
  } catch (error: any) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: error.message || "Failed to create testimonial" }, { status: 500 })
  }
}
