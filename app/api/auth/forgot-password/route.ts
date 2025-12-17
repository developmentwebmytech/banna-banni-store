export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { User } from "@/app/lib/models"
import { generateToken, hashToken } from "@/app/lib/jwt"
import { sendPasswordResetEmail } from "@/app/lib/email"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await User.findOne({ email })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    const resetToken = generateToken()
    const hashedResetToken = await hashToken(resetToken)

    user.passwordResetToken = hashedResetToken
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    await user.save()

    try {
      await sendPasswordResetEmail(email, resetToken)
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      // Don't expose email sending errors to the user
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
