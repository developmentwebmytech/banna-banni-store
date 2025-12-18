"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, RefreshCw, ShoppingBag } from "lucide-react";
import type { IProduct } from "@/app/lib/models/product";
import { getImageUrl } from "@/app/lib/utils";
import { WishlistButton } from "@/components/wishlist-button";
import { useParams } from "next/navigation";
import { useCart } from "@/components/context/CartContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";

type ProductData = {
  _id: string;
  name: string;
  description: string;
  price: number;
  total_price: number;
  oldPrice?: number;
  discount?: string;
  rating?: number;
  images: string[];
  category_id: string;
  brand_id?: string;
  variations?: any[];
  slug: string;
  createdAt: string;
  updatedAt: string;
};

const fallbackProducts: ProductData[] = [
  {
    _id: "fallback1",
    slug: "pastal-cream-lehenga",
    name: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    description:
      "Beautiful pastal cream lehenga with intricate sequence and thread embroidery work",
    images: ["/shopbycategory1.webp"],
    price: 4299,
    total_price: 5000,
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
    slug: "purple-sequence-lehenga",
    name: "Purple Sequence Thread Embroidery Lehenga",
    description:
      "Elegant purple lehenga with beautiful sequence and thread embroidery",
    images: ["/shopbycategory2.webp"],
    price: 4299,
    total_price: 5000,
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
    total_price: 5000,
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
    total_price: 5000,
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

export default function CategoryProductsPage() {
  const params = useParams();
  const categorySlug = params.slug as string;

  const [products, setProducts] = useState<(IProduct | ProductData)[]>([]);
  const [categoryName, setCategoryName] = useState("Category");
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState(4);
  const [sortBy, setSortBy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: string]: boolean;
  }>({});

  const { addToCart } = useCart();
  const { toast } = useToast();

  
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/category/${categorySlug}`);

        if (!res.ok) {
          throw new Error(
            `Failed to fetch products for category: ${res.status}`
          );
        }

        const data = await res.json();

        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          setCategoryName(
            data.categoryName ||
              categorySlug
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
          );
        } else {
          console.error("Invalid data structure:", data);
          setError("Invalid data received from server");
          setProducts(fallbackProducts);
          setCategoryName(
            categorySlug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
          );
        }
      } catch (error) {
        console.error("Failed to fetch products for category:", error);
        setError(
          "Failed to load products for this category. Using fallback data."
        );
        setProducts(fallbackProducts);
        setCategoryName(
          categorySlug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categorySlug]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);

    const sortedProducts = [...products];
    if (value === "lowToHigh") {
      sortedProducts.sort((a, b) => {
        const priceA = a.total_price || a.price;
        const priceB = b.total_price || b.price;
        return priceA - priceB;
      });
    } else if (value === "highToLow") {
      sortedProducts.sort((a, b) => {
        const priceA = a.total_price || a.price;
        const priceB = b.total_price || b.price;
        return priceB - priceA;
      });
    }
    setProducts(sortedProducts);
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
        price: product.price + priceModifier,
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="text-center py-6 md:py-10 px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-black">
            {categoryName} Collection
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Loading products for {categoryName}...
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-4 text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="text-center py-6 md:py-10 px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-black">
          {categoryName} Collection
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          Explore our exquisite collection of {categoryName.toLowerCase()}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div className="bg-white px-3 md:px-4 py-2 rounded shadow text-black text-sm md:text-base w-full sm:w-auto text-center">
            Total Products: {displayProducts.length}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center text-black w-full sm:w-auto">
            <div className="flex gap-2 justify-center sm:justify-start">
              {[1, 2, 3, 4].map((col) => (
                <button
                  key={col}
                  className={`border px-3 py-2 rounded text-sm ${
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
              className="border rounded px-3 py-2 text-sm md:text-base text-black w-full sm:w-auto"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="">Sort by</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="h-2 md:h-4"></div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6 text-sm md:text-base">
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
          {displayProducts.map((product) => (
            <div
              key={String(product._id)}
              className=" rounded  transition text-black group"
            >
              <div className="relative overflow-hidden bg-white rounded shadow hover:shadow-md transition-shadow">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative w-full bg-white rounded shadow hover:shadow-md transition-shadow">
                    <Image
                      src={
                        getImageUrl(product.images[0] || "") ||
                        "/placeholder.svg"
                      }
                      alt={product.name}
                      width={600}
                      height={600}
                      className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
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
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs sm:text-sm px-2 py-1 rounded">
                    {product.discount}
                  </span>
                )}
              </div>
              <Link href={`/products/${product.slug}`}>
                <div className="p-3 md:p-4 bg-white rounded shadow hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2 text-orange-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-current"
                            : "text-orange-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs sm:text-sm text-gray-600">
                      ({product.rating || 0})
                    </span>
                  </div>

                  <Link href={`/products/${product.slug}`} className="block">
                    <h3 className="text-xs sm:text-sm md:text-[15px] font-medium text-gray-800 leading-snug line-clamp-2 mb-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>

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

                  <div className="text-xs text-gray-600 py-2 md:py-3">
                    {(() => {
                      const totalStock =
                        product.variations?.reduce(
                          (sum, variation) => sum + (variation.stock || 0),
                          0
                        ) || 0;
                      return totalStock > 0
                        ? `${totalStock} items in stock`
                        : "Out of stock";
                    })()}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="h-10 md:h-16"></div>
    </div>
  );
}
