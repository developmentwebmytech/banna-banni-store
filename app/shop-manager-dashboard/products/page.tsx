"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/app/hooks/use-toast";

// Define proper interfaces for product data
interface ProductVariation {
  size: string;
  color: string;
  stock: number;
  price_modifier?: number;
}

interface ProductData {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  images: string[];
  category_id: string | { _id: string; name: string };
  brand_id: string | { _id: string; name: string };
  variations: ProductVariation[];
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryData {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
}

interface BrandData {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  slug: string;
}

// Utility function to get image URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/placeholder.svg?height=48&width=48&text=No+Image";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("data:")) return imagePath; // Handle base64 images
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
};

const roundTotalPrice = (price: number): number => {
  if (!price) return 0;

  // If the decimal part is exactly .00, just return the integer part
  if (price % 1 === 0) {
    return Math.floor(price);
  }

  // If there's any decimal part above .00, round up to next integer
  return Math.ceil(price);
};

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !brandsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      const typedProducts: ProductData[] = (productsData.products || []).map(
        (product: any) => ({
          _id: String(product._id || product.id || ""),
          name: product.name || "",
          description: product.description || "",
          price: Number(product.price) || 0,
          total_price: Number(product.total_price) || 0,
          oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
          discount: product.discount || undefined,
          rating: product.rating ? Number(product.rating) : undefined,
          images: product.images || [],
          category_id: product.category_id || "",
          brand_id: product.brand_id || "",
          variations: product.variations || [],
          slug: product.slug || "",
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })
      );

      const typedCategories: CategoryData[] = (categoriesData || []).map(
        (cat: any) => ({
          _id: String(cat._id || cat.id || ""),
          name: cat.name || "",
          description: cat.description,
          image: cat.image,
          slug: cat.slug || "",
        })
      );

      const typedBrands: BrandData[] = (brandsData.brands || []).map(
        (brand: any) => ({
          _id: String(brand._id || brand.id || ""),
          name: brand.name || "",
          description: brand.description,
          logo: brand.logo,
          slug: brand.slug || "",
        })
      );

      setProducts(typedProducts);
      setCategories(typedCategories);
      setBrands(typedBrands);
    } catch (err) {
      console.error("Data fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load products, categories, or brands",
        variant: "destructive",
      });
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (product: ProductData) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/products/${productToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getCategoryName = (
    categoryData: string | { _id: string; name: string }
  ) => {
    if (typeof categoryData === "string") {
      const category = categories.find((cat) => cat._id === categoryData);
      return category ? category.name : "N/A";
    } else if (
      categoryData &&
      typeof categoryData === "object" &&
      "name" in categoryData
    ) {
      return categoryData.name;
    }
    return "N/A";
  };

  const getBrandName = (brandData: string | { _id: string; name: string }) => {
    if (typeof brandData === "string") {
      const brand = brands.find((b) => b._id === brandData);
      return brand ? brand.name : "N/A";
    } else if (
      brandData &&
      typeof brandData === "object" &&
      "name" in brandData
    ) {
      return brandData.name;
    }
    return "N/A";
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(product.category_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getBrandName(product.brand_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Products
          </h2>
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="border-gray-300 bg-transparent"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/shop-manager-dashboard/products/new">
              <Button className="bg-teal-700 hover:bg-teal-800 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[80px] px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Image
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Name
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Category
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Brand
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Price
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.map((product, index) => (
                      <TableRow
                        key={product._id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <Image
                              src={getImageUrl(product.images[0] || "")}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "/placeholder.svg?height=48&width=48&text=No+Image";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-700">
                          {getCategoryName(product.category_id)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-700">
                          {getBrandName(product.brand_id)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            ₹
                            {roundTotalPrice(product.total_price || 0).toFixed(
                              2
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white border border-gray-200 shadow-lg"
                            >
                              <DropdownMenuItem
                                asChild
                                className="hover:bg-gray-50"
                              >
                                <Link
                                  href={`/shop-manager-dashboard/products/${product._id}`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(product)}
                                className="hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {currentProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-12 text-gray-500"
                        >
                          {searchTerm
                            ? "No products found matching your search."
                            : "No products found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="border-gray-300 hover:bg-gray-50 bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                currentPage === pageNumber
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNumber)}
                              className={
                                currentPage === pageNumber
                                  ? "bg-teal-700 hover:bg-teal-800 text-white"
                                  : "border-gray-300 hover:bg-gray-50"
                              }
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="border-gray-300 hover:bg-gray-50 bg-transparent"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{productToDelete?.name}"</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
