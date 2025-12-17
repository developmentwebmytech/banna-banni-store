import { NextRequest, NextResponse } from "next/server"
import bcrypt from 'bcryptjs';
import { verifyJwt } from "@/app/lib/jwt"
import User from "@/app/models/user"  

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt(token)
    if (!payload || typeof payload === "string" || !("userId" in payload)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = (payload as { userId: string }).userId

    const { currentPassword, newPassword } = await req.json()

    // MongoDB se user fetch karo
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Naya password hash karo
    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    user.passwordHash = newHashedPassword
    await user.save()

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
