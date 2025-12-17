"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Edit, Trash2, MoreHorizontal, ExternalLink, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/app/hooks/use-toast"

interface IBanner {
  _id: string
  image: string
  link?: string | null
  createdAt?: string
  updatedAt?: string
}

export default function BannerAdminPage() {
  const { toast } = useToast()
  const [banners, setBanners] = useState<IBanner[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<IBanner | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/banners", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch banners")
      }

      const data = await res.json()
      console.log("DASHBOARD: Received banners:", data.banners)
      setBanners(data.banners || [])
    } catch (err) {
      console.error("DASHBOARD: Fetch banners error:", err)
      toast({
        title: "Error",
        description: "Failed to load banners",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleDeleteClick = (banner: IBanner) => {
    setBannerToDelete(banner)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!bannerToDelete) return
    try {
      const res = await fetch(`/api/admin/banners/${bannerToDelete._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete banner")
      }

      toast({
        title: "Deleted",
        description: "Banner deleted successfully.",
      })
      fetchBanners() // Refresh the list
    } catch (error) {
      console.error("DASHBOARD: Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBannerToDelete(null)
    }
  }

  const renderLinkCell = (banner: IBanner) => {
    console.log("DASHBOARD: Rendering link for banner:", banner._id, "Link:", banner.link)

    if (!banner.link || banner.link.trim() === "") {
      return <span className="text-gray-400 italic">No link</span>
    }

    const isExternal = banner.link.startsWith("http://") || banner.link.startsWith("https://")
    const isInternal = banner.link.startsWith("/")

    return (
      <div className="flex items-center gap-2 max-w-xs">
        <span className="truncate text-sm font-mono bg-gray-100 px-2 py-1 rounded">{banner.link}</span>
        {isExternal && (
          <div className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-500 bg-blue-50 px-1 py-0.5 rounded">External</span>
          </div>
        )}
        {isInternal && (
          <div className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500 bg-green-50 px-1 py-0.5 rounded">Internal</span>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-4 text-gray-500">Loading banners...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Banner Management</h1>
          <p className="text-gray-600 mt-1">Total banners: {banners.length}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBanners} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/dashboard/banners/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No banners found.{" "}
                  <Link href="/dashboard/banners/new" className="text-blue-600 hover:underline">
                    Create your first banner
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="relative w-40 h-24 rounded overflow-hidden">
                      <Image
                        src={banner.image || "/placeholder.svg"}
                        alt="Banner Image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell>{renderLinkCell(banner)}</TableCell>
                  <TableCell>
                    {banner.createdAt ? (
                      <span className="text-sm text-gray-500">{new Date(banner.createdAt).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
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
                          <Link href={`/dashboard/banners/${banner._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(banner)} className="text-red-600">
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
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
