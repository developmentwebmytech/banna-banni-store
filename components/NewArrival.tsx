"use client";

import type React from "react";

import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { IProduct } from "@/app/lib/models/product";
import { useCart } from "@/components/context/CartContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";
import { getImageUrl } from "@/app/lib/utils";
import { WishlistButton } from "@/components/wishlist-button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const defaultProducts: IProduct[] = [
  {
    _id: "default1",
    images: ["/shopbycategory1.webp"],
    discount: "75%",
    name: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    price: 4299,
    total_price: 5000,
    oldPrice: 11999,
    rating: 4,
    slug: "pastal-cream-lehenga-1",
    variations: [{ color: "Cream", size: "M", stock: 10, price_modifier: 0 }],
    newarrival: true,
    bestseller: false,
    trending: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description:
      "Beautiful cream colored lehenga with intricate embroidery work",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "default2",
    images: ["/shopbycategory2.webp"],
    discount: "64%",
    name: "Elegant Blue Silk Saree with Zari Work",
    price: 5999,
    total_price: 5000,
    oldPrice: 16999,
    rating: 5,
    slug: "elegant-blue-silk-saree",
    variations: [{ color: "Blue", size: "Free", stock: 5, price_modifier: 0 }],
    newarrival: true,
    bestseller: false,
    trending: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description: "Elegant blue silk saree with traditional zari work",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "default3",
    images: ["/shopbycategory3.webp"],
    discount: "35%",
    name: "Traditional Red Bridal Gown with Heavy Embellishments",
    price: 8999,
    total_price: 5000,
    oldPrice: 13999,
    rating: 3.5,
    slug: "traditional-red-bridal-gown",
    variations: [{ color: "Red", size: "L", stock: 3, price_modifier: 0 }],
    newarrival: true,
    bestseller: false,
    trending: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description: "Traditional red bridal gown with heavy embellishments",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "default4",
    images: ["/shopbycategory1.webp"],
    discount: "44%",
    name: "Modern Green Anarkali Suit with Dupatta",
    price: 3499,
    total_price: 5000,
    oldPrice: 6299,
    rating: 4.5,
    slug: "modern-green-anarkali-suit",
    variations: [{ color: "Green", size: "S", stock: 12, price_modifier: 0 }],
    newarrival: true,
    bestseller: false,
    trending: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description: "Modern green anarkali suit with matching dupatta",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
];

const roundTotalPrice = (price: number): number => {
  if (!price) return 0;

  // If the decimal part is exactly .00, just return the integer part
  if (price % 1 === 0) {
    return Math.floor(price);
  }

  // If there's any decimal part above .00, round up to next integer
  return Math.ceil(price);
};

export default function NewArrival() {
  const [products, setProducts] = useState<IProduct[]>(defaultProducts); // Initialize with default products instead of empty array
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{
    [key: string]: number;
  }>({});

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        if (data && data.products && data.products.length > 0) {
          const newArrivalProducts = data.products.filter(
            (product: any) => product.newarrival === true
          );
          setProducts(
            newArrivalProducts.length > 0 ? newArrivalProducts : defaultProducts
          );
        } else {
          setProducts(defaultProducts);
        }
      } catch (err: any) {
        setError(err.message);
        setProducts(defaultProducts);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, product: IProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = String(product._id);
    setIsAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      const defaultVariation =
        product.variations && product.variations.length > 0
          ? product.variations[0]
          : null;

      const selectedSize = defaultVariation?.size || "N/A";
      const selectedColor = defaultVariation?.color || "N/A";
      const currentStock = defaultVariation?.stock || 0;
      const priceModifier = defaultVariation?.price_modifier || 0;

      if (currentStock === 0) {
        toast({
          title: "Out of stock",
          description: `${product.name} is currently out of stock`,
          variant: "destructive",
        });
        setIsAddingToCart((prev) => ({ ...prev, [productId]: false }));
        return;
      }

      const productForCart = {
        _id: product._id,
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
      setIsAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleImageNavigation = (
    productId: string,
    direction: "prev" | "next",
    totalImages: number
  ) => {
    setCurrentImageIndex((prev) => {
      const currentIndex = prev[productId] || 0;
      let newIndex;
      if (direction === "prev") {
        newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === totalImages - 1 ? 0 : currentIndex + 1;
      }
      return { ...prev, [productId]: newIndex };
    });
  };

  if (error && products.length === 0) {
    return (
      <section className="bg-white py-12 px-4 sm:px-8 lg:px-16 text-center text-red-500">
        <p>Error: {error}. Displaying default products.</p>
      </section>
    );
  }

  return (
    <section className="bg-white py-1 px-4 sm:px-8 lg:px-16">
      <div className="text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
          New Arrival
        </h2>
        <p className="text-center text-gray-500 text-sm mt-2 mb-10">
          Designed to enhance your look with elegance and grace, making every
          occasion unforgettable.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next-newarrival",
            prevEl: ".swiper-button-prev-newarrival",
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination-newarrival",
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="newarrival-swiper"
        >
          {products.map((product) => {
            const currentIndex = currentImageIndex[String(product._id)] || 0;
            const hasMultipleImages =
              product.images && product.images.length > 1;
            const productId = String(product._id);
            const isThisProductLoading = isAddingToCart[productId] || false;

            return (
              <SwiperSlide
                key={product._id?.toString() || `product-${product.slug}`}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300 relative group flex-shrink-0">
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      {product.discount}
                    </div>
                  )}

                  <div className="absolute top-2 right-2 z-10">
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

                  <div className="absolute top-12 right-2 z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 bg-gray-100 hover:bg-white rounded-full shadow-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(e, product);
                      }}
                      disabled={isThisProductLoading}
                    >
                      {isThisProductLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      <span className="sr-only">Add to Cart</span>
                    </Button>
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="block relative overflow-hidden"
                  >
                    <div className="relative">
                      <Image
                        src={getImageUrl(
                          product.images[currentIndex] ||
                            product.images[0] ||
                            ""
                        )}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="w-full h-[600px] object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
                            product.name
                          )}`; // Updated error handling for Image component
                        }}
                      />

                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleImageNavigation(
                                String(product._id),
                                "prev",
                                product.images.length
                              );
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          >
                            <svg
                              className="w-4 h-4 text-gray-800"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleImageNavigation(
                                String(product._id),
                                "next",
                                product.images.length
                              );
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          >
                            <svg
                              className="w-4 h-4 text-gray-800"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>

                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {product.images.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index === currentIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-center mb-2 text-orange-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 0)
                              ? "fill-current"
                              : "text-orange-300"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">
                        ({product.rating || 0})
                      </span>
                    </div>

                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="text-[15px] font-medium text-gray-800 leading-snug line-clamp-2 mb-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mt-2">
                      {product.oldPrice && (
                        <span className="line-through text-gray-500 text-sm">
                          MRP. {product.oldPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-red-600 font-bold text-sm">
                        Rs.{" "}
                        {roundTotalPrice(
                          product.total_price || product.price
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 py-2">
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
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="swiper-button-prev-newarrival absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10 cursor-pointer">
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="swiper-button-next-newarrival absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10 cursor-pointer">
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        <div className="swiper-pagination-newarrival flex justify-center mt-6 gap-2"></div>

        <style jsx>{`
          .newarrival-swiper .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: #d1d5db;
            opacity: 1;
            transition: all 0.2s;
          }
          .newarrival-swiper .swiper-pagination-bullet-active {
            background: #1f2937;
          }
        `}</style>
      </div>
    </section>
  );
}
