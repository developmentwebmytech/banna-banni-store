import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import ContactSubmission from "@/app/lib/models/ContactSubmission"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const submission = await ContactSubmission.findById(id)

    if (!submission) {
      return NextResponse.json({ error: "Contact submission not found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contact submission" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const data = await request.json()
    const updatedSubmission = await ContactSubmission.findByIdAndUpdate(id, data, { new: true })

    if (!updatedSubmission) {
      return NextResponse.json({ error: "Contact submission not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update contact submission" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const deletedSubmission = await ContactSubmission.findByIdAndDelete(id)

    if (!deletedSubmission) {
      return NextResponse.json({ error: "Contact submission not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Contact submission deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete contact submission" }, { status: 500 })
  }
}
