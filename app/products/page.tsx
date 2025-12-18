"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { IProduct } from "@/app/lib/models/product";
import { getImageUrl } from "@/app/lib/utils";
import { WishlistButton } from "@/components/wishlist-button";
import { useCart } from "@/components/context/CartContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";

type ProductData = {
  _id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  total_price?: number;
  oldPrice: number;
  discount: string;
  rating: number;
  images: string[];
  category_id: string;
  brand_id: string;
  variations: any[];
  createdAt: string;
  updatedAt: string;
};

const fallbackProducts: ProductData[] = [
  {
    _id: "fallback1",
    slug: "pastal-cream-color-sequence-thread-embroidery-lehenga",
    name: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    description:
      "Beautiful pastal cream lehenga with intricate sequence and thread embroidery work",
    images: ["/shopbycategory1.webp"],
    price: 4299,
    total_price: 4299,
    oldPrice: 11999,
    discount: "-75% OFF",
    rating: 4,
    category_id: "cat1",
    brand_id: "brand1",
    variations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "fallback2",
    slug: "purple-sequence-thread-embroidery-lehenga",
    name: "Purple Sequence Thread Embroidery Lehenga",
    description:
      "Elegant purple lehenga with beautiful sequence and thread embroidery",
    images: ["/shopbycategory2.webp"],
    price: 4299,
    total_price: 4299,
    oldPrice: 11999,
    discount: "-64% OFF",
    rating: 4,
    category_id: "cat1",
    brand_id: "brand2",
    variations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "fallback3",
    slug: "pink-embroidery-lehenga",
    name: "Pink Embroidery Lehenga",
    description: "Stunning pink lehenga with detailed embroidery work",
    images: ["/shopbycategory3.webp"],
    price: 4299,
    total_price: 4299,
    oldPrice: 11999,
    discount: "-35% OFF",
    rating: 4,
    category_id: "cat1",
    brand_id: "brand1",
    variations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "fallback4",
    slug: "red-designer-lehenga",
    name: "Red Designer Lehenga",
    description: "Gorgeous red designer lehenga with premium quality fabric",
    images: ["/shopbycategory1.webp"],
    price: 4299,
    total_price: 4299,
    oldPrice: 11999,
    discount: "-44% OFF",
    rating: 4,
    category_id: "cat1",
    brand_id: "brand3",
    variations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const roundTotalPrice = (price: number): number => {
  if (!price) return 0;

  if (price % 1 === 0) {
    return Math.floor(price);
  }

  return Math.ceil(price);
};

export default function ProductsPage() {
  const [products, setProducts] =
    useState<(IProduct | ProductData)[]>(fallbackProducts);
  const [sortBy, setSortBy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: string]: boolean;
  }>({});
  const itemsPerPage = 8;

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);
      try {
        const res = await fetch(`/api/products`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

        const data = await res.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setError("Invalid data structure");
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products. Using fallback data.");
        setProducts(fallbackProducts);
      }
    };

    fetchProducts();
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);

    if (value === "lowToHigh") {
      const sortedProducts = [...products].sort((a, b) => {
        const priceA = a.total_price || a.price;
        const priceB = b.total_price || b.price;
        return priceA - priceB;
      });
      setProducts(sortedProducts);
    } else if (value === "highToLow") {
      const sortedProducts = [...products].sort((a, b) => {
        const priceA = a.total_price || a.price;
        const priceB = b.total_price || b.price;
        return priceB - priceA;
      });
      setProducts(sortedProducts);
    }
  };

  const handleAddToCart = async (
    e: React.MouseEvent,
    product: IProduct | ProductData
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariation =
      product.variations && product.variations.length > 0
        ? product.variations[0]
        : null;
    const currentStock = defaultVariation?.stock || 0;

    if (currentStock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart((prev) => ({ ...prev, [String(product._id)]: true }));

    try {
      const selectedSize = defaultVariation?.size || "N/A";
      const selectedColor = defaultVariation?.color || "N/A";
      const priceModifier = defaultVariation?.price_modifier || 0;

      const productForCart = {
        _id: String(product._id),
        name: product.name,
        price: product.price,
        total_price: product.total_price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        images: product.images,
        slug: product.slug,
        rating: product.rating,
        selectedSize,
        selectedColor,
        stock: currentStock,
      };

      await addToCart(productForCart);

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [String(product._id)]: false }));
    }
  };

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = displayProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const imageAspectRatioClass =
    columns === 1 ? "aspect-[3/4]" : "aspect-square";
  const imagePlaceholderHeight = columns === 1 ? 800 : 600;
  const imagePlaceholderWidth = 600;

  const imageContainerHeight =
    columns === 1
      ? "h-[400px] sm:h-[500px] md:h-[600px]"
      : "h-[250px] sm:h-[300px] md:h-[400px]";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="text-center py-6 md:py-10 px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">
          All Collections
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          Hot Selling Designer Lehenga with Premium Quality
        </p>
      </div>

      <div
        className={`w-full ${
          columns > 1 ? "max-w-7xl mx-auto px-3 md:px-4" : "px-3 md:px-4"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div className="bg-white px-3 md:px-4 py-2 rounded shadow text-black w-full sm:w-auto text-center text-sm md:text-base">
            Total Product Count: {displayProducts.length}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 md:gap-4 w-full sm:w-auto">
            <div className="flex gap-2 items-center text-black justify-center sm:justify-start">
              {[1, 2, 3, 4].map((col) => (
                <button
                  key={col}
                  className={`border px-2 md:px-3 py-1 md:py-2 rounded text-sm ${
                    columns === col ? "bg-gray-300" : "bg-white"
                  }`}
                  onClick={() => setColumns(col)}
                  aria-label={`Show ${col} column${col > 1 ? "s" : ""}`}
                >
                  {"|".repeat(col)}
                </button>
              ))}
            </div>
            <select
              className="border rounded px-3 py-2 text-sm text-black w-full sm:w-auto"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="">Sort by</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-2 rounded mb-6 text-sm md:text-base">
            {error}
          </div>
        )}

        <div
          className={`grid gap-4 md:gap-6 ${
            columns === 1
              ? "grid-cols-1"
              : columns === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : columns === 3
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >
          {currentProducts.map((product) => (
            <div
              key={String(product._id)}
              className={` rounded-xl duration-300 text-black group ${
                columns === 1 ? "max-w-xl mx-auto" : ""
              }`}
            >
              <div className="relative bg-white shadow hover:shadow-md transition-shadow">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative w-full bg-white shadow hover:shadow-md transition-shadow">
                    <Image
                      src={getImageUrl(product.images[0] || "")}
                      alt={product.name}
                      width={600}
                      height={800}
                     className="w-full h-auto rounded-t object-contain transition-transform duration-300 group-hover:scale-105"
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/placeholder.svg?height=800&width=600`;
                      }}
                    />
                  </div>
                </Link>
                <div className="absolute top-2 right-2">
                  <WishlistButton
                    productId={String(product._id)}
                    product={{
                      _id: String(product._id),
                      name: product.name,
                      price: product.price,
                      total_price: product.total_price,
                      oldPrice: product.oldPrice,
                      discount: product.discount,
                      images: product.images,
                      slug: product.slug,
                      rating: product.rating,
                    }}
                  />
                </div>
                <div className="absolute top-12 sm:top-14 right-2 z-10">
                  {(() => {
                    const defaultVariation =
                      product.variations && product.variations.length > 0
                        ? product.variations[0]
                        : null;
                    const currentStock = defaultVariation?.stock || 0;
                    const isOutOfStock = currentStock <= 0;

                    return (
                      <Button
                        variant="secondary"
                        size="icon"
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-sm ${
                          isOutOfStock
                            ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed opacity-50"
                            : "bg-gray-100 hover:bg-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(e, product);
                        }}
                        disabled={
                          isAddingToCart[String(product._id)] || isOutOfStock
                        }
                      >
                        {isAddingToCart[String(product._id)] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                        ) : (
                          <ShoppingBag
                            className={`w-4 h-4 ${
                              isOutOfStock ? "text-gray-500" : ""
                            }`}
                          />
                        )}
                        <span className="sr-only">
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </span>
                      </Button>
                    );
                  })()}
                </div>
                {product.discount && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    {product.discount}
                  </span>
                )}
              </div>

              <Link href={`/products/${product.slug}`}>
                <div className="p-3 bg-white rounded shadow hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < product.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.073 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs sm:text-sm text-gray-600">
                      ({product.rating})
                    </span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-semibold hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                    {product.name.length > 50
                      ? product.name.slice(0, 50) + "..."
                      : product.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    {product.oldPrice && (
                      <span className="line-through text-gray-500 text-xs sm:text-sm">
                        MRP. {product.oldPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-red-600 font-bold text-xs sm:text-sm">
                      Rs.{" "}
                      {roundTotalPrice(
                        product.total_price || product.price
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span
                      className={`text-xs font-medium ${
                        product.variations && product.variations.length > 0
                          ? product.variations.reduce(
                              (total: number, variation: any) =>
                                total + (variation.stock || 0),
                              0
                            ) <= 0
                            ? "text-gray-600"
                            : "text-gray-600"
                          : "text-gray-600"
                      }`}
                    >
                      {product.variations && product.variations.length > 0
                        ? (() => {
                            const totalStock = product.variations.reduce(
                              (total: number, variation: any) =>
                                total + (variation.stock || 0),
                              0
                            );
                            return totalStock <= 0
                              ? "Out of Stock"
                              : `${totalStock} items in stock`;
                          })()
                        : "In Stock"}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center mt-6 md:mt-8 mb-6 md:mb-8 gap-4">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg ${
                      currentPage === page
                        ? "text-white bg-teal-700 border border-teal-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      <div className="h-10" />
    </div>
  );
}
