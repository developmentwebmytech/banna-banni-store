import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { connectDB } from "@/app/lib/db" // Corrected import path
import { Address } from "@/app/lib/models/address"
import { User } from "@/app/lib/models" // Corrected import for User

// GET - Fetch default address for the user
export async function GET() {
  try {
    console.log("Default address API called")

    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.email)

    if (!session?.user?.email) {
      console.log("No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    console.log("Database connected")

    const user = await User.findOne({ email: session.user.email })
    console.log("User found:", user?._id)

    if (!user) {
      console.log("User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const defaultAddress = await Address.findOne({
      userId: user._id.toString(),
      isDefault: true,
    }).lean()

    console.log("Default address found:", defaultAddress)

    return NextResponse.json({
      address: defaultAddress,
      debug: {
        userId: user._id.toString(),
        userEmail: session.user.email,
        addressFound: !!defaultAddress,
      },
    })
  } catch (error: unknown) {
    console.error("Error fetching default address:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
