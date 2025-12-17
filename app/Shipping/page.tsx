"use client"

import { useEffect, useState } from "react"

type ShippingPolicy = {
  _id: string
  title: string
  description: string
}

export default function ShippingPolicyPage() {
  const [data, setData] = useState<ShippingPolicy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch("/api/admin/shippingpolicy", {
          cache: "no-store",
        })
        const json = await res.json()
        setData(json?.[0] || null) // assuming only one shipping policy entry
      } catch (error) {
        console.error("Failed to load shipping policy", error)
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
        <h1 className="text-3xl font-semibold">{data?.title || "Shipping Policy"}</h1>
      </div>

      {/* Full-width Content Box */}
       <div className="w-full px-4 py-10">
        <div className="bg-white rounded-lg shadow-lg w-full p-8 text-[17px] leading-relaxed space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : data ? (
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.description }} />
          ) : (
            <div className="text-center text-red-500">No Shipping Policy found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
