"use client";

import type React from "react";

import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { IProduct } from "@/app/lib/models/product";
import { useCart } from "@/components/context/CartContext";
import { useToast } from "@/app/hooks/use-toast";
import { getImageUrl } from "@/app/lib/utils";
import { WishlistButton } from "@/components/wishlist-button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Default products to display if API is empty or fails
const defaultProducts: IProduct[] = [
  {
    _id: "bestseller-default1",
    images: ["/shopbycategory1.webp"],
    discount: "75%",
    name: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    description:
      "Beautiful pastal cream lehenga with intricate sequence and thread embroidery work. Perfect for weddings and special occasions.",
    price: 4299,
    total_price: 5000,
    oldPrice: 11999,
    rating: 4.8,
    slug: "bestseller-cream-lehenga-1",
    variations: [
      { color: "Cream", size: "S", stock: 8, price_modifier: 0 },
      { color: "Cream", size: "M", stock: 25, price_modifier: 0 },
      { color: "Cream", size: "L", stock: 12, price_modifier: 0 },
      { color: "Gold", size: "S", stock: 5, price_modifier: 50 },
      { color: "Gold", size: "M", stock: 18, price_modifier: 50 },
      { color: "Gold", size: "L", stock: 9, price_modifier: 50 },
    ],
    bestseller: true,
    trending: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "bestseller-default2",
    images: ["/shopbycategory3.webp"],
    discount: "64%",
    name: "Elegant Blue Silk Saree with Zari Work",
    description:
      "Elegant blue silk saree featuring beautiful zari work and traditional design. Made with premium silk fabric.",
    price: 5999,
    total_price: 5000,
    oldPrice: 16999,
    rating: 4.9,
    slug: "bestseller-blue-silk-saree",
    variations: [
      { color: "Blue", size: "Free Size", stock: 18, price_modifier: 0 },
      { color: "Navy", size: "Free Size", stock: 22, price_modifier: 0 },
      { color: "Royal Blue", size: "Free Size", stock: 15, price_modifier: 0 },
    ],
    bestseller: true,
    trending: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "bestseller-default3",
    images: ["/shopbycategory2.webp"],
    discount: "35%",
    name: "Traditional Red Bridal Gown with Heavy Embellishments",
    description:
      "Stunning red bridal gown with heavy embellishments perfect for special occasions. Features intricate beadwork and embroidery.",
    price: 8999,
    total_price: 5000,
    oldPrice: 13999,
    rating: 4.7,
    slug: "bestseller-red-bridal-gown",
    variations: [
      { color: "Red", size: "S", stock: 3, price_modifier: 0 },
      { color: "Red", size: "M", stock: 10, price_modifier: 0 },
      { color: "Red", size: "L", stock: 7, price_modifier: 0 },
      { color: "Maroon", size: "S", stock: 5, price_modifier: 100 },
      { color: "Maroon", size: "M", stock: 8, price_modifier: 100 },
      { color: "Maroon", size: "L", stock: 4, price_modifier: 100 },
    ],
    bestseller: true,
    trending: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IProduct,
  {
    _id: "bestseller-default4",
    images: ["/shopbycategory1.webp"],
    discount: "44%",
    name: "Modern Green Anarkali Suit with Dupatta",
    description:
      "Modern green anarkali suit with matching dupatta and contemporary design. Comfortable and stylish for all occasions.",
    price: 3499,
    total_price: 5000,
    oldPrice: 6299,
    rating: 4.6,
    slug: "bestseller-green-anarkali-suit",
    variations: [
      { color: "Green", size: "S", stock: 22, price_modifier: 0 },
      { color: "Green", size: "M", stock: 28, price_modifier: 0 },
      { color: "Green", size: "L", stock: 15, price_modifier: 0 },
      { color: "Mint Green", size: "S", stock: 12, price_modifier: 50 },
      { color: "Mint Green", size: "M", stock: 20, price_modifier: 50 },
      { color: "Mint Green", size: "L", stock: 8, price_modifier: 50 },
    ],
    bestseller: true,
    trending: false,
    newarrival: false,
    status: "live",
    category_id: "cat1",
    brand_id: "brand1",
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

export default function BestSeller() {
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
          return;
        }
        const data = await response.json();
        if (data && data.products && data.products.length > 0) {
          const bestsellerProducts = data.products.filter(
            (product: any) => product.bestseller === true
          );
          setProducts(
            bestsellerProducts.length > 0 ? bestsellerProducts : defaultProducts
          );
        }
      } catch (err: any) {
        console.warn(
          "Products API error, using default products:",
          err.message
        );
        setError(err.message);
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

      if (currentStock === 0) {
        toast({
          title: "Out of stock",
          description: `${product.name} is currently out of stock`,
          variant: "destructive",
        });
        setIsAddingToCart((prev) => ({
          ...prev,
          [String(product._id)]: false,
        }));
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
      setIsAddingToCart((prev) => ({ ...prev, [String(product._id)]: false }));
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

  const getTotalStock = (
    variations: { color: string; size: string; stock: number }[]
  ) => {
    return (
      variations?.reduce((total, variation) => total + variation.stock, 0) || 0
    );
  };

  return (
    <section className="bg-white  mt-4 py-18 px-4 sm:px-8 lg:px-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
        Best Seller
      </h2>
      <p className="text-center text-gray-600 text-sm mt-3 mb-10">
        Discover the Hot-Selling Designer Lehenga crafted with Premium Quality
        and Elegant Finishing –<br />A Timeless Style Statement for Every
        Occasion.
      </p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-800">
            Note: Using sample data due to API issues
          </p>
        </div>
      )}

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
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
        className="bestseller-swiper"
      >
        {products.map((product) => {
          const totalStock = getTotalStock(product.variations);
          const isOutOfStock = totalStock === 0;
          const currentIndex = currentImageIndex[String(product._id)] || 0;
          const hasMultipleImages = product.images && product.images.length > 1;

          return (
            <SwiperSlide key={String(product._id)}>
              <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300 relative group">
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
                        product.images[currentIndex] || product.images[0] || ""
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
                        }`} // Using 'rating' instead of 'ratings'
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

      <style jsx global>{`
        .bestseller-swiper .swiper-button-next,
        .bestseller-swiper .swiper-button-prev {
          color: white !important;
          width: 30px !important;
          height: 30px !important;
          margin-top: -15px !important;
          background: rgba(0, 0, 0, 0.5) !important;
          border-radius: 50% !important;
          padding: 8px !important;
        }

        .bestseller-swiper .swiper-button-next:after,
        .bestseller-swiper .swiper-button-prev:after {
          font-size: 12px !important;
          font-weight: bold !important;
        }

        .bestseller-swiper .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.7 !important;
          width: 8px !important;
          height: 8px !important;
        }

        .bestseller-swiper .swiper-pagination-bullet-active {
          opacity: 1 !important;
          background: white !important;
        }
      `}</style>
    </section>
  );
}
