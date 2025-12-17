import { NextResponse } from "next/server"
import connectDB from "@/app/lib/mongodb"
import { User } from "@/app/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { isValidObjectId } from "mongoose"
import bcrypt from "bcryptjs"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(id).select("-password").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await req.json()
    const { firstName, lastName, email, password, role } = body

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.firstName = firstName
    user.lastName = lastName
    user.email = email
    user.role = role

    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    await user.save()

    const updatedUser = await User.findById(id).select("-password").lean()

    return NextResponse.json({ user: updatedUser, message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.email === session.user?.email) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
