import nodemailer from "nodemailer"

// Create transporter for Gmail
const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const config = {
      service: "gmail", // Use Gmail service
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }

    console.log("Gmail SMTP Configuration:", {
      service: "gmail",
      user: config.auth.user,
      hasPassword: !!config.auth.pass,
    })

    return nodemailer.createTransport(config)
  }
  return null
}

const transporter = createTransporter()

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

  console.log("=== PASSWORD RESET EMAIL ===")
  console.log("To:", email)
  console.log("From:", process.env.SMTP_FROM)
  console.log("Reset Link:", resetUrl)
  console.log("Gmail SMTP Configured:", !!transporter)
  console.log("============================")

  if (!transporter) {
    console.log("No Gmail SMTP configuration found. Email logged to console only.")
    if (process.env.NODE_ENV === "development") {
      return true
    }
    throw new Error("Email service not configured")
  }

  try {
    // Test Gmail connection
    await transporter.verify()
    console.log("Gmail SMTP connection verified successfully ✅")

    const mailOptions = {
      from: `"Your Store" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "🔐 Password Reset Request - Your Store",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="background-color: #2563eb; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px;">🔐</span>
              </div>
              <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: 700;">Password Reset</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Secure your account with a new password</p>
            </div>
            
            <!-- Content -->
            <div style="margin-bottom: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Hello! 👋
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
                We received a request to reset your password. Click the button below to create a new password for your account:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.3s ease;">
                  🔑 Reset My Password
                </a>
              </div>
              
              <!-- Alternative Link -->
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">
                  Can't click the button? Copy and paste this link:
                </p>
                <p style="word-break: break-all; color: #2563eb; font-size: 14px; margin: 0; font-family: monospace;">
                  ${resetUrl}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; text-align: center;">
              <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #92400e; margin: 0; font-weight: 600;">
                  ⏰ This link expires in 10 minutes
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  This email was sent from Your Store<br>
                  © ${new Date().getFullYear()} Your Store. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
      text: `
Password Reset Request

Hello!

We received a request to reset your password for your account.

Reset your password by clicking this link:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this password reset, you can safely ignore this email.

---
Your Store
© ${new Date().getFullYear()} Your Store. All rights reserved.
      `,
    }

    console.log("Sending email via Gmail...")
    const result = await transporter.sendMail(mailOptions)

    console.log("✅ Email sent successfully via Gmail!")
    console.log("Message ID:", result.messageId)
    console.log("Accepted:", result.accepted)
    console.log("Response:", result.response)

    return true
  } catch (error) {
    console.error("❌ Gmail sending error:", error)

    // Type guard to check if error has the expected properties
    const isNodemailerError = (err: unknown): err is { code: string; message: string } => {
      return typeof err === "object" && err !== null && "code" in err && "message" in err
    }

    // Log specific Gmail errors with proper type checking
    if (isNodemailerError(error)) {
      if (error.code === "EAUTH") {
        console.error("Authentication failed. Check your Gmail app password.")
      }
      if (error.code === "ECONNECTION") {
        console.error("Connection failed. Check your internet connection.")
      }
    }

    // In development, continue even if email fails
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email sending failed in development. Reset link is available in console above.")
      return true
    }

    // Safely get error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    throw new Error(`Failed to send email via Gmail: ${errorMessage}`)
  }
}
