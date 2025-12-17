
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import connectDB from "@/app/lib/mongodb"
import { Address } from "@/app/lib/models/address"
import { User } from "@/app/lib/models"

// PUT - Set an address as default
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { id } = await params // Await params

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if address belongs to user
    const existingAddress = await Address.findOne({
      _id: id, // Use awaited id
      userId: user._id.toString(),
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found or does not belong to user" }, { status: 404 })
    }

    // Update all addresses for this user to not be default
    await Address.updateMany({ userId: user._id.toString() }, { isDefault: false })

    // Set the specified address as default
    const address = await Address.findByIdAndUpdate(id, { isDefault: true }, { new: true })

    return NextResponse.json({ address })
  } catch (error) {
    console.error("Error setting default address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
