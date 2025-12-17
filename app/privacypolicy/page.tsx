"use client"

import { useEffect, useState } from "react"

type PrivacyPolicy = {
  _id: string
  title: string
  description: string
}

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<PrivacyPolicy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch("/api/admin/privacypolicy", {
          cache: "no-store",
        })
        const json = await res.json()
        setData(json?.[0] || null) // assuming only one policy entry
      } catch (error) {
        console.error("Failed to load privacy policy", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [])

  return (
    <div className="flex flex-col w-full bg-gray-100 min-h-screen">
      {/* Top Heading */}
      <div className="bg-teal-800 text-white text-center py-16">
        <h1 className="text-3xl font-semibold">{data?.title || "Privacy Policy"}</h1>
      </div>

      {/* Full-width Content Box with max-width and centering */}
     <div className="w-full px-4 py-10">
        {" "}
        {/* Added this wrapper div */}
        <div className="bg-white rounded-lg shadow-lg w-full p-8 text-[17px] leading-relaxed space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : data ? (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <div className="text-center text-red-500">No Privacy Policy found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
