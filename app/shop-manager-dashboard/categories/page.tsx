"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Search, RefreshCw, MoreHorizontal, Eye, ImageIcon } from "lucide-react"
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

interface ICategoryDisplay {
  _id: string
  name: string
  images: string
  description: string
  slug: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesAdminPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<ICategoryDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<ICategoryDisplay | null>(null)

  // Function to fetch categories from the API
  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Dashboard: Fetching categories from API")
      const res = await fetch("/api/categories")

      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      console.log("[v0] Dashboard: Raw API response:", data)

      setCategories(data)
    } catch (err) {
      console.error("[v0] Dashboard: Category fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Handler for delete button click
  const handleDeleteClick = (category: ICategoryDisplay) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  // Handler for confirming deletion
  const confirmDelete = async () => {
    if (!categoryToDelete) return
    try {
      const res = await fetch(`/api/categories/${categoryToDelete._id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Deleted", description: "Category deleted successfully." })
      fetchCategories() // Refresh the list after deletion
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link href="/dashboard/categories/new">
          <Button className="bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="flex gap-2 max-w-md"
      >
        <Input placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("")
            fetchCategories()
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </form>

      <div className="bg-white rounded-md shadow p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                  <p>Loading categories...</p>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.images ? (
                        <>
                          <div className="flex -space-x-2">
                            <img
                              key={category.slug}
                              src={category.images || "/placeholder.svg?height=32&width=32&query=category thumbnail"}
                              alt={`${category.name}`}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                              title={`Image: ${category.name}`}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">No images</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {category.description
                        ? category.description.length > 50
                          ? `${category.description.substring(0, 50)}...`
                          : category.description
                        : "No description"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                       
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/categories/${category._id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-red-600">
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
              Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>? This action cannot be undone.
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
