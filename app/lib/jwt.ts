import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret"
const EXPIRES_IN = "7d"

// Generates a random token (used for email/forgot-password)
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Hashes a token using bcrypt
export async function hashToken(token: string): Promise<string> {
  return await bcrypt.hash(token, 12)
}

// Compares raw token to hashed token
export async function verifyToken(token: string, hashedToken: string): Promise<boolean> {
  return await bcrypt.compare(token, hashedToken)
}

// Signs a JWT
export function signJwt(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

// Verifies a JWT
export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
