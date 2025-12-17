"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, MoreHorizontal, Eye, EyeOff, ExternalLink } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/app/hooks/use-toast"

interface IHeaderCategory {
  _id: string
  name: string
  slug: string
  title: string
  description?: string
  images: string[]
  icon?: string
  color?: string
  isActive: boolean
  order: number
}

export default function HeaderCategoriesAdminPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<IHeaderCategory[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<IHeaderCategory | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/header-categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      toast({
        title: "Error",
        description: "Failed to load header categories",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDeleteClick = (category: IHeaderCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    try {
      await fetch(`/api/admin/header-categories/${categoryToDelete._id}`, {
        method: "DELETE",
      })
      toast({
        title: "Deleted",
        description: "Header category deleted successfully.",
      })
      fetchCategories()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete header category",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const toggleActive = async (category: IHeaderCategory) => {
    try {
      await fetch(`/api/admin/header-categories/${category._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...category, isActive: !category.isActive }),
      })
      toast({
        title: "Updated",
        description: `Header category ${!category.isActive ? "activated" : "deactivated"} successfully.`,
      })
      fetchCategories()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update header category",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Header Categories</h1>
          <p className="text-gray-600 mt-1">Manage main navigation categories with collections</p>
        </div>
        <Link href="/dashboard/header-categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Header Category
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No header categories found. Add your first category to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <Badge variant="outline">{category.order}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={category.title}>
                      {category.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.images?.length || 0} images</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
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
                          <Link href={`/dashboard/header-categories/${category._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${category.slug}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Collections
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(category)}>
                          {category.isActive ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-red-600">
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
              Are you sure you want to delete this header category? This action cannot be undone and will remove it from
              the main navigation and all associated collections.
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
