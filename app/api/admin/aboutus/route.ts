import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import AboutUs from "@/app/lib/models/aboutus"

export async function GET() {
  await connectDB()
  try {
    const aboutUsContent = await AboutUs.findOne({}) // Fetch the single document
    return NextResponse.json(aboutUsContent || {}, { status: 200 }) // Return empty object if not found
  } catch (error) {
    console.error("Error fetching admin About Us content:", error)
    return NextResponse.json({ error: "Failed to fetch About Us content" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await connectDB()
  try {
    const body = await request.json()
    // Find and update, or create if not exists (upsert)
    const updatedAboutUs = await AboutUs.findOneAndUpdate({}, body, {
      new: true,
      upsert: true, // Create if no document matches
      runValidators: true,
    })
    return NextResponse.json(updatedAboutUs, { status: 201 })
  } catch (error: any) {
    console.error("Error creating/updating About Us content:", error)
    return NextResponse.json({ error: error.message || "Failed to save About Us content" }, { status: 500 })
  }
}

export async function DELETE() {
  await connectDB()
  try {
    const deletedContent = await AboutUs.findOneAndDelete({}) // Delete the single document
    if (!deletedContent) {
      return NextResponse.json({ message: "No About Us content found to delete" }, { status: 404 })
    }
    return NextResponse.json({ message: "About Us content deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting About Us content:", error)
    return NextResponse.json({ error: "Failed to delete About Us content" }, { status: 500 })
  }
}
