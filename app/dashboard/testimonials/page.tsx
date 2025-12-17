"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Edit, Trash2, Search, RefreshCw, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useToast } from "@/app/hooks/use-toast"

// Define a proper interface for testimonial data
interface TestimonialData {
  _id: string
  name: string
  image: string
  rating: number
  review: string
  sku?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export default function TestimonialsAdminPage() {
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<TestimonialData | null>(null)

  const fetchTestimonials = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/testimonials")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      const testimonialList = Array.isArray(data) ? data : (data.testimonials ?? [])

      // Ensure each testimonial has the correct structure
      const typedTestimonials: TestimonialData[] = testimonialList.map((testimonial: any) => ({
        _id: String(testimonial._id || testimonial.id || ""),
        name: testimonial.name || "",
        image: testimonial.image || "",
        rating: Number(testimonial.rating) || 0,
        review: testimonial.review || "",
        sku: testimonial.sku || undefined,
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt,
      }))

      setTestimonials(typedTestimonials)
    } catch (err) {
      console.error("Testimonial fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive",
      })
      setTestimonials([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleDeleteClick = (testimonial: TestimonialData) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!testimonialToDelete || !testimonialToDelete._id) return

    try {
      const res = await fetch(`/api/admin/testimonials/${testimonialToDelete._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete testimonial")
      }

      toast({
        title: "Success",
        description: "Testimonial deleted successfully.",
      })

      // Remove the deleted testimonial from state immediately
      setTestimonials((prevTestimonials) =>
        prevTestimonials.filter((testimonial) => testimonial._id !== testimonialToDelete._id),
      )
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete testimonial",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
    }
  }

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (testimonial.sku && testimonial.sku.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleRefresh = () => {
    setSearchTerm("")
    fetchTestimonials()
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-500">
          ★
        </span>,
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-500">
          ☆
        </span>,
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ☆
        </span>,
      )
    }

    return stars
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Testimonials</h1>
        <Link href="/dashboard/testimonials/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Testimonial
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, review, or SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                    <p className="text-gray-500">Loading testimonials...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">
                      {searchTerm ? "No testimonials match your search." : "No testimonials found."}
                    </p>
                    {searchTerm && (
                      <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial._id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                      {testimonial.image ? (
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name || "Reviewer image"}
                          fill
                          className="object-cover"
                          sizes="48px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={testimonial.name}>
                      {testimonial.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                      <span className="ml-1 text-sm text-gray-600">({testimonial.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={testimonial.review}>
                      {testimonial.review}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={testimonial.sku ? "" : "text-gray-400"}>{testimonial.sku || "N/A"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/testimonials/${testimonial._id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(testimonial)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the testimonial by <strong>"{testimonialToDelete?.name}"</strong>? This
              action cannot be undone.
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
