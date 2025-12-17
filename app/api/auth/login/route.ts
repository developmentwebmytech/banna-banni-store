import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { User } from "@/app/lib/models"
import { signJwt } from "@/app/lib/jwt"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    console.log("Login attempt for email:", email) // Debug log

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await User.findOne({ email })

    if (!user) {
      console.log("User not found for email:", email) // Debug log
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.log("Invalid password for email:", email) // Debug log
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = signJwt({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    const userResponse = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    }

    console.log("Login successful for:", email, "User data:", userResponse) // Debug log

    const response = NextResponse.json({
      token,
      user: userResponse,
    })

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
