export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { User } from "@/app/lib/models"
import { hashToken } from "@/app/lib/jwt"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const hashedToken = await hashToken(token)
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    await user.save()

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
