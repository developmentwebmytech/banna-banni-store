import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { connectDB } from "@/app/lib/db"
import { SeoMeta } from "@/app/lib/models/SeoMeta"

async function getaboutusMeta(): Promise<Metadata> {
  try {
    // Build absolute URL so server-side fetch to route handler works reliably
    const h = headers()
    const proto = h.get("x-forwarded-proto") ?? "http"
    const host = h.get("host")
    const base = host ? `${proto}://${host}` : ""
    const url = `${base}/api/seo-meta?pageType=about`

    const res = await fetch(url, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      const data = json?.data
      if (data) {
        const keywords: string[] = Array.isArray(data.keywords)
          ? data.keywords
          : typeof data.keywords === "string"
            ? data.keywords
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : []
        return {
          title: data.title,
          description: data.description,
          keywords,
        }
      }
    }
  } catch {
    // fall through to DB fallback
  }

  // DB fallback: ensure we are connected and fetch directly if API fetch failed
  try {
    await connectDB()
    const data = await SeoMeta.findOne({ pageType: "about" })
    if (data) {
      const keywords: string[] = Array.isArray(data.keywords)
        ? data.keywords
        : typeof data.keywords === "string"
          ? data.keywords
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : []
      return {
        title: data.title,
        description: data.description,
        keywords,
      }
    }
  } catch {
    // swallow and use static fallback
  }

  // Fallback to your current static SEO if API/DB not available
  return {
    title: "About Us -Banna Banni Store",
    description: "Learn more About Us- Banna Banni Store.",
    keywords: ["About Us - Banna Banni Store"],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return await getaboutusMeta()
}

export default function aboutusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
