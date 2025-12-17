"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface ICoupon {
  _id: string
  code: string
  description?: string
  discountType: "percentage" | "flat"
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

export default function CouponAdminPage() {
  const [coupons, setCoupons] = useState<ICoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<ICoupon | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()

      if (data.success) {
        setCoupons(data.coupons || [])
      } else {
        toast.error("Failed to load coupons")
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast.error("Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleDeleteClick = (coupon: ICoupon) => {
    setCouponToDelete(coupon)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!couponToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/coupons/${couponToDelete._id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Coupon deleted successfully")
        fetchCoupons()
      } else {
        toast.error(data.error || "Failed to delete coupon")
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast.error("Failed to delete coupon")
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setCouponToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6 p-8">
      <ToastContainer position="bottom-right" />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Coupon Management</h1>
        <Link href="/shop-manager-dashboard/coupons/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2">Loading coupons...</p>
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No coupons found. Create your first coupon!
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell className="max-w-xs truncate">{coupon.description || "-"}</TableCell>
                  <TableCell className="capitalize">{coupon.discountType}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>{coupon.minPurchase ? `₹${coupon.minPurchase}` : "-"}</TableCell>
                  <TableCell>{coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}</TableCell>
                  <TableCell>
                    {coupon.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/shop-manager-dashboard/coupons/${coupon._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(coupon)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the coupon <strong>"{couponToDelete?.code}"</strong>?
              <br />
              <span className="text-sm text-red-600 mt-2 block">
                This action cannot be undone and will affect any pending orders using this coupon.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
