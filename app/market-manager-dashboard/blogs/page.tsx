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

// Define a proper interface for blog data
interface BlogData {
  _id: string
  title: string
  description: string
  image: string
  content: string
  slug: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export default function BlogsAdminPage() {
  const { toast } = useToast()
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<BlogData | null>(null)

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/marketmanager/blogs")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      const blogList = Array.isArray(data) ? data : (data.blogs ?? [])

      // Ensure each blog has the correct structure
      const typedBlogs: BlogData[] = blogList.map((blog: any) => ({
        _id: String(blog._id || blog.id || ""),
        title: blog.title || "",
        description: blog.description || "",
        image: blog.image || "",
        content: blog.content || "",
        slug: blog.slug || "",
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      }))

      setBlogs(typedBlogs)
    } catch (err) {
      console.error("Blog fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      })
      setBlogs([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleDeleteClick = (blog: BlogData) => {
    setBlogToDelete(blog)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!blogToDelete || !blogToDelete._id) return

    try {
      const res = await fetch(`/api/marketmanager/blogs/${blogToDelete._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete blog post")
      }

      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      })

      // Remove the deleted blog from state immediately
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogToDelete._id))
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete blog post",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBlogToDelete(null)
    }
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRefresh = () => {
    setSearchTerm("")
    fetchBlogs()
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Blog Posts</h1>
        <Link href="/market-manager-dashboard/blogs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title or description"
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
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                    <p className="text-gray-500">Loading blog posts...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">
                      {searchTerm ? "No blog posts match your search." : "No blog posts found."}
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
              filteredBlogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                      {blog.image ? (
                        <Image
                          src={blog.image || "/placeholder.svg"}
                          alt={blog.title || "Blog image"}
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
                    <div className="max-w-xs truncate" title={blog.title}>
                      {blog.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={blog.description}>
                      {blog.description}
                    </div>
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
                          <Link href={`/market-manager-dashboard/blogs/${blog._id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(blog)}
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
              Are you sure you want to delete <strong>"{blogToDelete?.title}"</strong>? This action cannot be undone.
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
