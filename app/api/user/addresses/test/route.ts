import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { connectDB } from "@/app/lib/db" // Corrected import path for db
import { Address } from "@/app/lib/models/address" // Corrected import for Address
import { User } from "@/app/lib/models" // Corrected import for User

// GET - Test address fetching
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all addresses for this user
    const allAddresses = await Address.find({ userId: user._id.toString() }).lean()
    const defaultAddress = await Address.findOne({
      userId: user._id.toString(),
      isDefault: true,
    }).lean()

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
      },
      totalAddresses: allAddresses.length,
      addresses: allAddresses,
      defaultAddress: defaultAddress,
      hasDefault: !!defaultAddress,
    })
  } catch (error: unknown) {
    // Explicitly type error as unknown
    console.error("Error in test API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "An unknown error occurred", // Safely access message
      },
      { status: 500 },
    )
  }
}
