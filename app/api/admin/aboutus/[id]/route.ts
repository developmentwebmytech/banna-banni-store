import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import AboutUs from "@/app/lib/models/aboutus"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const aboutUsContent = await AboutUs.findById(id)
    if (!aboutUsContent) {
      return NextResponse.json({ error: "About Us content not found" }, { status: 404 })
    }
    return NextResponse.json(aboutUsContent, { status: 200 })
  } catch (error) {
    console.error(`Error fetching About Us content:`, error)
    return NextResponse.json({ error: "Failed to fetch About Us content" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updatedAboutUs = await AboutUs.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedAboutUs) {
      return NextResponse.json({ error: "About Us content not found" }, { status: 404 })
    }

    return NextResponse.json(updatedAboutUs, { status: 200 })
  } catch (error: any) {
    console.error(`Error updating About Us content:`, error)
    return NextResponse.json(
      {
        error: error.message || "Failed to update About Us content",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deletedContent = await AboutUs.findByIdAndDelete(id)
    if (!deletedContent) {
      return NextResponse.json({ error: "About Us content not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "About Us content deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error deleting About Us content:`, error)
    return NextResponse.json({ error: "Failed to delete About Us content" }, { status: 500 })
  }
}
