
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import connectDB from "@/app/lib/mongodb"
import { Address } from "@/app/lib/models/address"
import { User } from "@/app/lib/models"

// PUT - Update an address
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // If this is set as default, update other addresses to not be default
    if (isDefault) {
      await Address.updateMany(
        {
          userId: user._id.toString(),
          _id: { $ne: id }, // Use awaited id
        },
        { isDefault: false },
      )
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id, // Use awaited id
      {
        streetAddress: address, // Renamed from 'address' to 'streetAddress' to match model
        city,
        state,
        zipCode: zipcode, // Renamed from 'zipcode' to 'zipCode' to match model
        country,
        countryCode,
        mobileNumber,
        isDefault: isDefault || false,
      },
      { new: true },
    )

    return NextResponse.json({ address: updatedAddress })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete an address
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Don't allow deletion of default address if it's the only one
    if (existingAddress.isDefault) {
      const addressCount = await Address.countDocuments({
        userId: user._id.toString(),
      })

      if (addressCount === 1) {
        return NextResponse.json(
          {
            error: "Cannot delete the only address. Add another address first.",
          },
          { status: 400 },
        )
      }

      // If deleting default address, set another one as default
      await Address.findOneAndUpdate(
        {
          userId: user._id.toString(),
          _id: { $ne: id }, // Use awaited id
        },
        { isDefault: true },
      )
    }

    await Address.findByIdAndDelete(id) // Use awaited id

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
