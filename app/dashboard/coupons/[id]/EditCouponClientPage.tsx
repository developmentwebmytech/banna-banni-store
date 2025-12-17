"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface ICoupon {
  _id?: string
  code: string
  description?: string
  discountType: "percentage" | "flat"
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  expiresAt?: string
  isActive: boolean
}

export default function EditCouponClientPage({ id }: { id: string }) {
  const isNew = id === "new"
  const router = useRouter()

  const [data, setData] = useState<ICoupon>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchase: undefined,
    maxDiscount: undefined,
    expiresAt: "",
    isActive: true,
  })

  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNew) fetchCoupon()
    else setIsLoading(false)
  }, [id, isNew])

  const fetchCoupon = async () => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`)
      if (!res.ok) throw new Error("Failed to fetch coupon")
      const coupon = await res.json()
      setData({
        ...coupon,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      })
    } catch (err) {
      console.error("Error fetching coupon:", err)
      toast.error("Could not load coupon")
      router.push("/dashboard/coupons")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (name: string, value: any) => {
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    if (!data.code || !data.discountValue) {
      toast.error("Code and discount value are required")
      return
    }

    if (data.discountType === "percentage" && data.discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%")
      return
    }

    if (data.discountValue <= 0) {
      toast.error("Discount value must be greater than 0")
      return
    }

    setIsSaving(true)
    try {
      const url = isNew ? `/api/admin/coupons` : `/api/admin/coupons/${id}`
      const method = isNew ? "POST" : "PUT"

      const submitData = {
        ...data,
        code: data.code.toUpperCase().trim(),
        expiresAt: data.expiresAt || null,
        discountValue: Number(data.discountValue),
        minPurchase: data.minPurchase ? Number(data.minPurchase) : undefined,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      }

      console.log("Submitting coupon data:", submitData)

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const result = await res.json()
      console.log("API response:", result)

      if (result.success || res.ok) {
        toast.success(isNew ? "Coupon created successfully!" : "Coupon updated successfully!")
        setTimeout(() => {
          router.push("/dashboard/coupons")
        }, 1000)
      } else {
        toast.error(result.error || "Failed to save coupon")
      }
    } catch (err) {
      console.error("Error saving coupon:", err)
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="ml-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <ToastContainer position="bottom-right" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="hover:bg-teal-600 hover:text-white bg-transparent">
            <Link href="/dashboard/coupons">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create Coupon" : "Edit Coupon"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/coupons")} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" disabled={isSaving} className="bg-teal-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={data.code}
            onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
            disabled={isSaving}
            placeholder="e.g., SAVE20, FLAT100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={data.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isSaving}
            placeholder="Brief description of the coupon"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type *</Label>
          <Select value={data.discountType} onValueChange={(value) => handleChange("discountType", value)}>
            <SelectTrigger id="discountType">
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent className="bg-amber-50">
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="flat">Flat Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">Discount Value * {data.discountType === "percentage" ? "(%)" : "(₹)"}</Label>
          <Input
            id="discountValue"
            type="number"
            min="0"
            max={data.discountType === "percentage" ? "100" : undefined}
            value={data.discountValue || ""}
            onChange={(e) => handleChange("discountValue", Number(e.target.value))}
            disabled={isSaving}
            placeholder={data.discountType === "percentage" ? "e.g., 10" : "e.g., 100"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPurchase">Minimum Purchase Amount (₹)</Label>
          <Input
            id="minPurchase"
            type="number"
            min="0"
            value={data.minPurchase ?? ""}
            onChange={(e) => handleChange("minPurchase", e.target.value ? Number(e.target.value) : undefined)}
            disabled={isSaving}
            placeholder="e.g., 500 (optional)"
          />
          <p className="text-xs text-gray-500">Leave empty for no minimum purchase requirement</p>
        </div>

        {data.discountType === "percentage" && (
          <div className="space-y-2">
            <Label htmlFor="maxDiscount">Maximum Discount Amount (₹)</Label>
            <Input
              id="maxDiscount"
              type="number"
              min="0"
              value={data.maxDiscount ?? ""}
              onChange={(e) => handleChange("maxDiscount", e.target.value ? Number(e.target.value) : undefined)}
              disabled={isSaving}
              placeholder="e.g., 1000 (optional)"
            />
            <p className="text-xs text-gray-500">Maximum discount cap for percentage-based coupons</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiry Date</Label>
          <Input
            id="expiresAt"
            type="date"
            value={data.expiresAt || ""}
            onChange={(e) => handleChange("expiresAt", e.target.value)}
            disabled={isSaving}
            min={new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-gray-500">Leave empty for no expiry date</p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="isActive"
            type="checkbox"
            checked={data.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            disabled={isSaving}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isActive" className="text-sm font-medium">
            Active (users can apply this coupon)
          </Label>
        </div>
      </form>
    </div>
  )
}
