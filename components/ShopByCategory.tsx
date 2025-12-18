"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface IHeaderCategory {
  _id: string;
  name: string;
  slug?: string;
  title?: string;
  description?: string;
  images?: string; // 👈 string not array
  isActive?: boolean;
}

export default function HeaderCategoryPage() {
  const [categories, setCategories] = useState<IHeaderCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeaderCategory = async () => {
      setError(null);
      try {
        console.log("[v0] Fetching categories from API");
        const res = await fetch(`/api/categories`);

        if (!res.ok) {
          throw new Error(`Failed to fetch header category: ${res.status}`);
        }

        const data = await res.json();
        console.log("[v0] Categories API response:", data);
        const categoryList = Array.isArray(data) ? data : data.categories || [];
        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to fetch header category:", error);
        setError("Failed to load category");
        setCategories([]);
      }
    };

    fetchHeaderCategory();
  }, []);

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.044-5.709-2.709M15 3.935c.915.15 1.76.486 2.527.965M9 3.935A9.678 9.678 0 0112 3c1.036 0 2.024.174 2.935.465"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Categories Found
          </h1>
          <p className="text-gray-500 text-center max-w-md">
            {error
              ? "Unable to load categories. Please try again later."
              : "No categories are available at the moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header Section */}
      <div className="text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
          Shop By Category
        </h2>
        <p className="text-center text-gray-500 text-sm mt-2 mb-10">
          Designed to enhance your look with elegance and grace, making every
          occasion unforgettable.
        </p>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {categories.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                nextEl: ".swiper-button-next-category",
                prevEl: ".swiper-button-prev-category",
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-category",
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              className="category-swiper"
            >
              {categories.map((category) => (
                <SwiperSlide key={category._id}>
                  <Link
                    href={`/categories/${category.slug || category._id}`}
                    className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors"
                  >
                    <div className="group cursor-pointer">
                      <div className="bg-white rounded-md shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        {category.images ? (
                          <div className="relative w-full">
                            <Image
                              src={category.images}
                              alt={category.name}
                              width={600}
                              height={800}
                              className="w-full h-auto rounded-md object-contain transition-transform duration-300 group-hover:scale-105"
                              priority
                              onError={() =>
                                console.log(
                                  `[v0] Image failed for category: ${category.name}`,
                                  category.images
                                )
                              }
                            />
                          </div>
                        ) : (
                          <div className="w-full bg-gray-100 flex items-center justify-center py-20">
                            <p className="text-sm text-gray-400">No Image</p>
                          </div>
                        )}

                        {/* Category Name */}
                        <div className="py-4 px-6">
                          <div className="flex items-center justify-between">
                            {category.name}
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all duration-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="swiper-button-prev-category absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10 cursor-pointer">
              <svg
                className="h-6 w-6 text-gray-600"
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
            <div className="swiper-button-next-category absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10 cursor-pointer">
              <svg
                className="h-6 w-6 text-gray-600"
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

            <div className="swiper-pagination-category flex justify-center mt-10 pt-2 space-x-2"></div>

            <style jsx>{`
              .category-swiper .swiper-pagination-bullet {
                width: 12px;
                height: 12px;
                background: #d1d5db;
                opacity: 1;
                transition: all 0.2s;
              }
              .category-swiper .swiper-pagination-bullet-active {
                background: #059669;
              }
            `}</style>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">
              This category doesn't have any products available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
