"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Edit, Trash2, Search, RefreshCw, MoreHorizontal, Eye } from "lucide-react"
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

// Define a proper interface for shop by category product data
interface ShopByCategoryProductData {
  _id: string
  images: string[]
  title: string
  description: string
  category: string
  price: number
  mrp: number
  discount: string
  ratings: number
  slug: string
  variations?: Array<{
    color: string
    size: string
    stock: number
    sku?: string
  }>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export default function ShopByCategoryAdminPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<ShopByCategoryProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ShopByCategoryProductData | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/shopbycategory")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      const productList = Array.isArray(data) ? data : (data.products ?? [])

      // Ensure each product has the correct structure
      const typedProducts: ShopByCategoryProductData[] = productList.map((product: any) => ({
        _id: String(product._id || product.id || ""),
        images: product.images || [],
        title: product.title || "",
        description: product.description || "",
        category: product.category || "",
        price: Number(product.price) || 0,
        mrp: Number(product.mrp) || 0,
        discount: product.discount || "",
        ratings: Number(product.ratings) || 0,
        slug: product.slug || "",
        variations: product.variations || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }))

      setProducts(typedProducts)
    } catch (err) {
      console.error("Shop By Category product fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to load shop by category products",
        variant: "destructive",
      })
      setProducts([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDeleteClick = (product: ShopByCategoryProductData) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete || !productToDelete._id) return

    try {
      const res = await fetch(`/api/admin/shopbycategory/${productToDelete._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Shop by category product deleted successfully.",
      })

      // Remove the deleted product from state immediately
      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productToDelete._id))
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete shop by category product",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRefresh = () => {
    setSearchTerm("")
    fetchProducts()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Shop By Category Products</h1>
        <Link href="/dashboard/shopbycategory/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Category Product
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title or category"
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
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Ratings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                    <p className="text-gray-500">Loading shop by category products...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">
                      {searchTerm ? "No products match your search." : "No shop by category products found."}
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
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.title || "Product image"}
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
                    <div className="max-w-xs truncate" title={product.title}>
                      {product.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={product.category}>
                      {product.category}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-gray-500 line-through">{formatPrice(product.mrp)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {product.discount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{product.ratings}</span>
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
                          <Link href={`/dashboard/shopbycategory/view/${product._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/shopbycategory/${product._id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product)}
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
              Are you sure you want to delete <strong>"{productToDelete?.title}"</strong>? This action cannot be undone.
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
