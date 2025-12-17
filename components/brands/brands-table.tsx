"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/app/hooks/use-toast"
import { Edit, Trash2 } from "lucide-react"
import type { IBrand } from "@/app/lib/model"
import { Pagination } from "@/components/pagination"

interface BrandsTableProps {
  brands: IBrand[]
  totalPages: number
  page: number
  per_page: number
}

export function BrandsTable({ brands, totalPages, page, per_page }: BrandsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Failed to delete brand")

      toast({
        title: "Success",
        description: "Brand deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete brand",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const renderDesktopRow = (brand: IBrand) => {
    const brandId = brand._id?.toString()
    if (!brandId) return null

    return (
      <>
        <TableCell>
          {brand.image ? (
            <Image
              src={brand.image || "/placeholder.svg"}
              alt={brand.name || "Brand"}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              No img
            </div>
          )}
        </TableCell>
        <TableCell className="font-medium">{brand.name || "Unnamed Brand"}</TableCell>
        <TableCell>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "N/A"}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/brands/${brandId}`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-gray-500 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the brand "{brand.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(brandId)}
                    disabled={isDeleting === brandId}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting === brandId ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop view */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              brands
                .filter((brand) => brand._id) // Filter out brands without _id
                .map((brand) => <TableRow key={brand._id?.toString()}>{renderDesktopRow(brand)}</TableRow>)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {brands?.length === 0 ? (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">No brands found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {brands
              .filter((brand) => brand._id) // Filter out brands without _id
              .map((brand) => {
                const id = brand._id!.toString() // We know _id exists due to filter
                return (
                  <div key={id} className="border rounded-md overflow-hidden">
                    <div className="p-4 flex items-center space-x-3">
                      {brand.image ? (
                        <Image
                          src={brand.image || "/placeholder.svg"}
                          alt={brand.name || "Brand"}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{brand.name || "Unnamed Brand"}</p>
                        <p className="text-xs text-muted-foreground">
                          {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="border-t p-4 bg-muted/30 flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/brands/${id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the brand "{brand.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(id)}
                              disabled={isDeleting === id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting === id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  )
}
