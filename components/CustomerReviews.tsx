"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Star, StarHalf, ChevronLeft, ChevronRight } from "lucide-react"
import type { ITestimonial } from "@/app/lib/models/testimonial"

// Create a plain data interface for testimonials
interface TestimonialData {
  _id: string
  name: string
  image: string
  rating: number
  review: string
  sku: string
  createdAt: Date
  updatedAt: Date
}

// Default testimonials to display if API is empty or fails
const defaultTestimonials: TestimonialData[] = [
  {
    _id: "default-test1",
    name: "Manshi Yadav",
    image: "/shopbycategory1.webp", // Place these images in /public
    rating: 4.5,
    review: "Light Green color Sequence & Thread Embroidery work Designer Lehenga Choli for Wedding Function",
    sku: "BL1473",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default-test2",
    name: "Priya Sharma",
    image: "/shopbycategory2.webp",
    rating: 5.0,
    review:
      "Absolutely stunning! The fabric quality is superb and the design is even better in person. Highly recommend!",
    sku: "SA2001",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "default-test3",
    name: "Anjali Singh",
    image: "/shopbycategory3.webp",
    rating: 4.0,
    review: "Beautiful gown, fits perfectly. Received many compliments. A bit heavy but worth it for the look.",
    sku: "GO3005",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<(ITestimonial | TestimonialData)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(3)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials")
        }
        const data = await response.json()
        if (data && data.length > 0) {
          setTestimonials(data)
        } else {
          setTestimonials(defaultTestimonials)
        }
      } catch (err: any) {
        setError(err.message)
        setTestimonials(defaultTestimonials) // Fallback to default on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1)
      } else {
        setItemsPerSlide(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const getStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} className="text-orange-500 w-4 h-4 fill-orange-500" />)
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalf key={i} className="text-orange-500 w-4 h-4 fill-orange-500" />)
      } else {
        stars.push(<Star key={i} className="text-gray-300 w-4 h-4" />)
      }
    }
    return stars
  }

  if (isLoading) {
    return (
      <section className="bg-[#e4ebf2] py-12 px-4 text-center">
        <p>Loading customer reviews...</p>
      </section>
    )
  }

  if (error && testimonials.length === 0) {
    return (
      <section className="bg-[#e4ebf2] py-12 px-4 text-center text-red-500">
        <p>Error: {error}. Displaying default reviews.</p>
      </section>
    )
  }

  return (
    <section className="bg-[#e4ebf2] py-12 px-4 mt-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Customer Love & Trust</h2>
        <p className="text-gray-600 mt-1">Over {testimonials.length} reviews sharing their experience</p>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`, width: `${totalSlides * 100}%` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="flex gap-6" style={{ width: `${100 / totalSlides}%` }}>
                {testimonials
                  .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                  .map((testimonial, index) => (
                    <div
                      key={testimonial._id?.toString() || `testimonial-${index}`}
                      className="bg-white rounded-xl shadow p-4 flex-shrink-0"
                      style={{ width: `${100 / itemsPerSlide}%` }}
                    >
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={300}
                        height={200}
                        className="rounded-md object-cover w-full h-[300px]"
                      />
                      <div className="flex gap-1 mt-4">{getStars(testimonial.rating)}</div>
                      <h3 className="font-semibold mt-2">{testimonial.name}</h3>
                      <p className="text-sm text-gray-700 mt-1 leading-tight">{testimonial.review}</p>
                      <p className="text-sm mt-1 text-gray-600">{testimonial.sku || "N/A"}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > itemsPerSlide && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {testimonials.length > itemsPerSlide && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
