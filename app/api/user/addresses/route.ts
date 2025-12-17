import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import connectDB from "@/app/lib/mongodb"
import { Address } from "@/app/lib/models/address"
import { User } from "@/app/lib/models"

// GET - Fetch all addresses for the user
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

    const addresses = await Address.find({ userId: user._id.toString() }).sort({ isDefault: -1, createdAt: -1 }).lean()

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { address, city, state, zipcode, country, countryCode, mobileNumber, isDefault } = body

    // Validate required fields
    if (!address || !city || !state || !zipcode || !country || !countryCode || !mobileNumber) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If this is set as default, update other addresses to not be default
    if (isDefault) {
      await Address.updateMany({ userId: user._id.toString() }, { isDefault: false })
    }

    const newAddress = new Address({
      userId: user._id.toString(),
      address,
      city,
      state,
      zipcode,
      country,
      countryCode,
      mobileNumber,
      isDefault: isDefault || false,
    })

    await newAddress.save()

    return NextResponse.json({ address: newAddress })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
