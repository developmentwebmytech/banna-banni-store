"use client"

import { useEffect, useState } from "react"

type TermsAndConditions = {
  _id: string
  title: string
  description: string
}

export default function TermsAndConditionsPage() {
  const [data, setData] = useState<TermsAndConditions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch("/api/admin/termsandconditions", {
          cache: "no-store",
        })
        const json = await res.json()
        setData(json?.[0] || null) // assuming only one terms and conditions entry
      } catch (error) {
        console.error("Failed to load terms and conditions", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [])

  return (
    <div className="flex flex-col w-full bg-gray-100 min-h-screen">
      {/* Top Heading */}
      <div className="bg-teal-800 text-white text-center py-14">
        <h1 className="text-3xl font-semibold">{data?.title || "Terms & Conditions"}</h1>
      </div>

      {/* Full-width Content Box */}
      <div className="w-full px-4 py-10">
        <div className="bg-white rounded-lg shadow-lg w-full p-8 text-[17px] leading-relaxed space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : data ? (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <div className="text-center text-red-500">No Terms and Conditions found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
