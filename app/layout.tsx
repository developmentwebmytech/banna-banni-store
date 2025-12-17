import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import SessionProviderWrapper from "./providers/SessionProviderWrapper"
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Banna Banni Store",
  description: "Your favorite online shopping destination",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </SessionProviderWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
