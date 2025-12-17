import { NextResponse } from "next/server"
import {connectDB} from "@/app/lib/db"
import AboutUs from "@/app/lib/models/aboutus"

export async function GET() {
  await connectDB()
  try {
    // Fetch the single About Us document. Assuming there will only be one.
    const aboutUsContent = await AboutUs.findOne({})
    if (!aboutUsContent) {
      return NextResponse.json({ message: "About Us content not found" }, { status: 404 })
    }
    return NextResponse.json(aboutUsContent, { status: 200 })
  } catch (error) {
    console.error("Error fetching About Us content:", error)
    return NextResponse.json({ error: "Failed to fetch About Us content" }, { status: 500 })
  }
}
