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
    _id: "trending-default1",
    images: ["/shopbycategory1.webp"],
    discount: "70%",
    name: "Trendy Floral Print Kurti Set",
    price: 2999,
    total_price: 5000,
    oldPrice: 9999,
    rating: 4.5,
    slug: "trendy-floral-kurti-set-1",
    variations: [{ color: "Yellow", size: "M", stock: 10, price_modifier: 0 }],
    trending: true,
    bestseller: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description:
      "Beautiful trendy floral print kurti set perfect for casual wear. Made with premium cotton fabric and vibrant prints.",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "trending-default2",
    images: ["/shopbycategory2.webp"],
    discount: "60%",
    name: "Stylish Georgette Anarkali Dress",
    price: 3500,
    total_price: 5000,
    oldPrice: 8999,
    rating: 4.0,
    slug: "stylish-georgette-anarkali-dress",
    variations: [{ color: "Black", size: "M", stock: 8, price_modifier: 0 }],
    trending: true,
    bestseller: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description:
      "Elegant georgette anarkali dress for special occasions. Features beautiful embroidery and comfortable fit.",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "trending-default3",
    images: ["/shopbycategory3.webp"],
    discount: "40%",
    name: "Classic Cotton Saree with Border",
    price: 1800,
    total_price: 5000,
    oldPrice: 2999,
    rating: 3.8,
    slug: "classic-cotton-saree",
    variations: [
      { color: "Red", size: "Free Size", stock: 20, price_modifier: 0 },
    ],
    trending: true,
    bestseller: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description:
      "Classic cotton saree with beautiful border design. Perfect for daily wear and office occasions.",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "trending-default4",
    images: ["/shopbycategory1.webp"],
    discount: "50%",
    name: "Modern Fusion Top with Palazzo",
    price: 2200,
    total_price: 5000,
    oldPrice: 4400,
    rating: 4.2,
    slug: "modern-fusion-top-palazzo",
    variations: [{ color: "Blue", size: "M", stock: 14, price_modifier: 0 }],
    trending: true,
    bestseller: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    description:
      "Modern fusion top with matching palazzo for contemporary look. Comfortable and stylish for all occasions.",
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
export default function Trending() {
  const [products, setProducts] = useState<IProduct[]>(defaultProducts);
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
          console.warn("Products API failed, using default products");
          setProducts(defaultProducts);
          return;
        }
        const data = await response.json();
        if (data && data.products && data.products.length > 0) {
          const trendingProducts = data.products.filter(
            (product: any) => product.trending === true
          );
          setProducts(
            trendingProducts.length > 0 ? trendingProducts : defaultProducts
          );
        } else {
          setProducts(defaultProducts);
        }
      } catch (err: any) {
        console.warn(
          "Products API error, using default products:",
          err.message
        );
        setError(err.message);
        setProducts(defaultProducts);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, product: IProduct) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart((prev) => ({ ...prev, [String(product._id)]: true }));

    try {
      const defaultVariation =
        product.variations && product.variations.length > 0
          ? product.variations[0]
          : null;

      const selectedSize = defaultVariation?.size || "N/A";
      const selectedColor = defaultVariation?.color || "N/A";
      const currentStock = defaultVariation?.stock || 0;
      const priceModifier = defaultVariation?.price_modifier || 0;

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
      setIsAddingToCart((prev) => ({ ...prev, [String(product._id)]: false }));
    }
  };

  const getTotalStock = (
    variations: { color: string; size: string; stock: number }[]
  ) => {
    return (
      variations?.reduce((total, variation) => total + variation.stock, 0) || 0
    );
  };

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
        Trending
      </h2>
      <p className="text-center text-gray-600 text-sm mt-3 mb-10">
        Step into elegance with our Designer Lehenga collection – known for its
        premium quality,
        <br />
        flawless stitching, and stunning designs.
      </p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-800">
            Note: Using sample data due to API issues
          </p>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next-trending",
            prevEl: ".swiper-button-prev-trending",
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination-trending",
          }}
          autoplay={{
            delay: 4000,
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
          className="trending-swiper"
        >
          {products.map((product) => {
            const totalStock = getTotalStock(product.variations);
            const isLowStock = totalStock > 0 && totalStock <= 5;
            const isOutOfStock = totalStock === 0;
            const currentIndex = currentImageIndex[String(product._id)] || 0;
            const hasMultipleImages =
              product.images && product.images.length > 1;

            return (
              <SwiperSlide
                key={product._id?.toString() || `trending-${product.slug}`}
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
                      disabled={isAddingToCart[String(product._id)] || false}
                    >
                      {isAddingToCart[String(product._id)] ? (
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
                   <div className="relative w-full">
                      <Image
                        src={getImageUrl(
                          product.images[currentIndex] ||
                            product.images[0] ||
                            ""
                        )}
                        alt={product.name}
                        width={600}
                        height={600}
                       className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
                            product.name
                          )}`; // Using 'name' instead of 'title'
                        }}
                      />

                      {hasMultipleImages && (
                        <>
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

                    <div className="mt-2">
                      {isOutOfStock ? (
                        <span className="text-xs text-gray-600 font-medium">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-xs text-gray-600 font-medium">
                          Only {totalStock} items left!
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600 font-medium">
                          {totalStock} items available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="swiper-button-prev-trending absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10 cursor-pointer">
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
        <div className="swiper-button-next-trending absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10 cursor-pointer">
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

        <div className="swiper-pagination-trending flex justify-center mt-6 gap-2"></div>

        <style jsx>{`
          .trending-swiper .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: #d1d5db;
            opacity: 1;
            transition: all 0.2s;
          }
          .trending-swiper .swiper-pagination-bullet-active {
            background: #1f2937;
          }
        `}</style>
      </div>
    </section>
  );
}
