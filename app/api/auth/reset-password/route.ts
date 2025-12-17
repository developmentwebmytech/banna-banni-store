export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { User } from "@/app/lib/models"
import { verifyToken } from "@/app/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Find user with a valid reset token that hasn't expired
    const user = await User.findOne({
      passwordResetToken: { $exists: true },
      passwordResetExpires: { $gt: new Date() },
    })

    if (!user || !user.passwordResetToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Verify the token (now guaranteed to be a string)
    const isValidToken = await verifyToken(token, user.passwordResetToken)
    if (!isValidToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    return NextResponse.json({
      message: "Password has been reset successfully. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
