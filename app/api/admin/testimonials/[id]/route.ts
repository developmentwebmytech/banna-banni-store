import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import Testimonial from "@/app/lib/models/testimonial"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const testimonial = await Testimonial.findById(id)
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }
    return NextResponse.json(testimonial, { status: 200 })
  } catch (error) {
    console.error(`Error fetching testimonial:`, error)
    return NextResponse.json({ error: "Failed to fetch testimonial" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTestimonial, { status: 200 })
  } catch (error: any) {
    console.error(`Error updating testimonial:`, error)
    return NextResponse.json(
      {
        error: error.message || "Failed to update testimonial",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deletedTestimonial = await Testimonial.findByIdAndDelete(id)
    if (!deletedTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "Testimonial deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error deleting testimonial:`, error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
