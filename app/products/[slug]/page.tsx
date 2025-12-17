"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CheckCircle, ShoppingCart, Star, ArrowLeft, Package, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/app/hooks/use-toast"
import { useCart } from "@/components/context/CartContext"
import type { IProduct } from "@/app/lib/models/product"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageUrl } from "@/app/lib/utils"

// Create a type for plain product data without Mongoose Document methods
type ProductData = {
  _id: string
  name: string
  description: string
  price: number
  total_price?: number // Added total_price field to ProductData type
  oldPrice: number
  discount: string
  rating: number
  images: string[]
  category_id: string
  brand_id: string
  variations: {
    size: string
    color: string
    stock: number
    price_modifier: number
  }[]
  slug: string
  createdAt: string
  updatedAt: string
}

// 3pc Lehenga type
type ThreePcLehenga = {
  _id: string
  designCode: string
  designName: string
  lehngaType: string
  blouseStitching: string
  skirtStitching: string
  fabricType: string
  blouseFabric: string
  skirtFabric: string
  dupattaFabric: string
  workAndPrint: string
  lehengaManufacturer: string
  hasKenken: boolean
  quantity: number
  wholesalerId: {
    name: string
  }
}

// Blouse type
type Blouse = {
  _id: string
  financialYear: string
  wholesalerId: {
    name: string
  }
  fabricType: string
  workAndPrint: string
  bustSize: string
  blouseLength: string
  sleeveLength: string
  blouseManufacturer: string
  quantity: number
}

// One-Pc Kurti type
type OnePcKurti = {
  _id: string
  financialYear: string
  wholesalerId: {
    name: string
  }
  kurtiFabricType: string
  work: string
  bustSize: string
  kurtiLength: string
  sleeveLength: string
  kurtiManufacturer: string
  quantity: number
}

// Two-Pc Kurti type
type TwoPcKurti = {
  _id: string
  financialYear: string
  wholesalerId: {
    name: string
  }
  kurtiFabricType: string
  pattern: string
  work: string
  bustSize: string
  kurtiLength: string
  sleeveLength: string
  pantLength: string
  pantWaistSize: string
  pantHipSize: string
  stretchable: boolean
  kurtiManufacturer: string
  quantity: number
}

// Petticoat Kurti type
type PetticoatKurti = {
  _id: string
  financialYear: string
  wholesalerId: {
    name: string
  }
  petticoatFabricType: string
  work: string
  waistSize: string
  petticoatLength: string
  manufacturer: string
  quantity: number
}

// Three-Pc Kurti type
type ThreePcKurti = {
  _id: string
  financialYear: string
  wholesalerId: {
    name: string
  }
  kurtiFabricType: string
  pattern: string
  work: string
  bustSize: string
  kurtiLength: string
  sleeveLength: string
  pantLength: string
  pantWaistSize: string
  pantHipSize: string
  stretchable: boolean
  dupattaLength: string
  dupattaWidth: string
  kurtiManufacturer: string
  quantity: number
}

const roundTotalPrice = (price: number): number => {
  if (!price) return 0

  // If the decimal part is exactly .00, just return the integer part
  if (price % 1 === 0) {
    return Math.floor(price)
  }

  // If there's any decimal part above .00, round up to next integer
  return Math.ceil(price)
}
// Loading skeleton component
function ProductDetailSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Details skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-3" />
              <Skeleton className="h-6 w-1/2 mb-4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error component
function ProductError({ onRetry }: { onRetry: () => void }) {
  const router = useRouter()

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </div>
    </div>
  )
}

// Main page component
export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<IProduct | ProductData | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<(IProduct | ProductData)[]>([])
  const [threePcLehengas, setThreePcLehengas] = useState<ThreePcLehenga[]>([])
  const [blouses, setBlouses] = useState<Blouse[]>([])
  const [onePcKurtis, setOnePcKurtis] = useState<OnePcKurti[]>([])
  const [twoPcKurtis, setTwoPcKurtis] = useState<TwoPcKurti[]>([])
  const [petticoatKurtis, setPetticoatKurtis] = useState<PetticoatKurti[]>([])
  const [threePcKurtis, setThreePcKurtis] = useState<ThreePcKurti[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [currentStock, setCurrentStock] = useState<number | null>(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const productsPerSlide = 4
  const totalSlides = Math.max(
    1,
    Math.ceil(((Array.isArray(relatedProducts) ? relatedProducts.length : 0) || 0) / productsPerSlide),
  )

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const getCurrentProducts = () => {
    const startIndex = currentSlide * productsPerSlide
    return relatedProducts.slice(startIndex, startIndex + productsPerSlide)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      if (e.key === "Escape") {
        setIsModalOpen(false)
      } else if (e.key === "ArrowLeft") {
        prevImage()
      } else if (e.key === "ArrowRight") {
        nextImage()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  // Helper to derive an Instagram embed URL from a post/reel URL
  function getInstagramEmbedUrl(url?: string | null): string | null {
    if (!url) return null
    try {
      const u = new URL(url)
      // Normalize path to /p/{code}/embed or /reel/{code}/embed
      const parts = u.pathname.split("/").filter(Boolean)
      // Expected: ["p","CODE"] or ["reel","CODE"] or ["tv","CODE"]
      if (parts.length >= 2) {
        const type = parts[0] // p | reel | tv
        const code = parts[1]
        return `https://www.instagram.com/${type}/${code}/embed`
      }
      // Fallback to oEmbed endpoint could be added if needed
      return null
    } catch {
      return null
    }
  }

  // Whether video is available
  const instagramEmbedUrl = getInstagramEmbedUrl((product as any)?.instagram_url)

  const images = product?.images || []
  const galleryItems =
    images.length > 0
      ? [
          { type: "image" as const, src: images[0] },
          ...(instagramEmbedUrl ? [{ type: "video" as const, src: instagramEmbedUrl }] : []),
          ...images.slice(1).map((img) => ({ type: "image" as const, src: img })),
        ]
      : [...(instagramEmbedUrl ? [{ type: "video" as const, src: instagramEmbedUrl }] : [])]

  useEffect(() => {
    if (!product) return
    const first = product.images?.[0] || null
    setSelectedImage(first)
    setCurrentImageIndex(0)
  }, [product, instagramEmbedUrl])

  // Override next/prev/goTo logic to use galleryItems length for images section
  const totalGallery = galleryItems.length
  const nextImage = () => {
    if (totalGallery > 0) {
      const nextIndex = (currentImageIndex + 1) % totalGallery
      setCurrentImageIndex(nextIndex)
      const item = galleryItems[nextIndex]
      if (item.type === "image") {
        setSelectedImage(item.src)
        setImageLoading(true)
      } else {
        setSelectedImage(null)
        setImageLoading(false)
      }
    }
  }
  const prevImage = () => {
    if (totalGallery > 0) {
      const prevIndex = currentImageIndex === 0 ? totalGallery - 1 : currentImageIndex - 1
      setCurrentImageIndex(prevIndex)
      const item = galleryItems[prevIndex]
      if (item.type === "image") {
        setSelectedImage(item.src)
        setImageLoading(true)
      } else {
        setSelectedImage(null)
        setImageLoading(false)
      }
    }
  }
  const goToImage = (index: number) => {
    if (index < 0 || index >= totalGallery) return
    setCurrentImageIndex(index)
    const item = galleryItems[index]
    if (item.type === "image") {
      setSelectedImage(item.src)
      setImageLoading(true)
    } else {
      setSelectedImage(null)
      setImageLoading(false)
    }
  }

  const fetchProduct = async () => {
    if (!slug) return

    setLoading(true)
    setError(false)

    try {
      console.log(`[v0] Fetching product with slug: ${slug}`)
      const res = await fetch(`/api/products/${slug}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        console.error(`[v0] API returned status: ${res.status}`)
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data: IProduct = await res.json()
      console.log(`[v0] Successfully fetched product:`, data)
      console.log(`[v0] Raw API response data:`, JSON.stringify(data, null, 2))
      console.log(`[v0] Related products in response:`, data.relatedProducts)
      console.log(`[v0] Type of relatedProducts:`, typeof data.relatedProducts)
      console.log(`[v0] Is relatedProducts an array:`, Array.isArray(data.relatedProducts))

      setProduct(data)

      if (data.relatedProducts && Array.isArray(data.relatedProducts)) {
        console.log(`[v0] Found ${data.relatedProducts.length} related products`)
        console.log(`[v0] Related products data:`, data.relatedProducts)
        setRelatedProducts(data.relatedProducts)
      } else {
        console.log("[v0] No related products found or not an array")
        console.log(`[v0] relatedProducts value:`, data.relatedProducts)
        setRelatedProducts([])
      }

      // Fetch associated items
      if (data._id) {
        console.log(`Fetching 3pc lehengas for product ID: ${data._id}`)
        const lehengaRes = await fetch(`/api/admin/3pc-lehengas?parentId=${data._id}`)
        if (lehengaRes.ok) {
          const lehengaData = await lehengaRes.json()
          console.log(`Found ${lehengaData.length} 3pc lehengas`)
          setThreePcLehengas(lehengaData)
        } else {
          console.log(`3pc lehengas API returned status: ${lehengaRes.status}`)
        }

        console.log(`Fetching blouses for product ID: ${data._id}`)
        const blouseRes = await fetch(`/api/admin/blouses?parentId=${data._id}`)
        if (blouseRes.ok) {
          const blouseData = await blouseRes.json()
          console.log(`Found ${blouseData.length} blouses:`, blouseData)
          setBlouses(blouseData)
        } else {
          console.log(`Blouses API returned status: ${blouseRes.status}`)
        }

        console.log(`Fetching one-pc kurtis for product ID: ${data._id}`)
        const kurtiRes = await fetch(`/api/admin/one-pc-kurtis?parentId=${data._id}`)
        if (kurtiRes.ok) {
          const kurtiData = await kurtiRes.json()
          console.log(`Found ${kurtiData.length} one-pc kurtis:`, kurtiData)
          setOnePcKurtis(kurtiData)
        } else {
          console.log(`One-pc kurtis API returned status: ${kurtiRes.status}`)
        }

        console.log(`Fetching two-pc kurtis for product ID: ${data._id}`)
        const twoPcKurtiRes = await fetch(`/api/admin/two-pc-kurtis?parentId=${data._id}`)
        if (twoPcKurtiRes.ok) {
          const twoPcKurtiData = await twoPcKurtiRes.json()
          console.log(`Found ${twoPcKurtiData.length} two-pc kurtis:`, twoPcKurtiData)
          setTwoPcKurtis(twoPcKurtiData)
        } else {
          console.log(`Two-pc kurtis API returned status: ${twoPcKurtiRes.status}`)
        }

        console.log(`Fetching three-pc kurtis for product ID: ${data._id}`)
        const threePcKurtiRes = await fetch(`/api/admin/three-pc-kurtis?parentId=${data._id}`)
        if (threePcKurtiRes.ok) {
          const threePcKurtiData = await threePcKurtiRes.json()
          console.log(`Found ${threePcKurtiData.length} three-pc kurtis:`, threePcKurtiData)
          setThreePcKurtis(threePcKurtiData)
        } else {
          console.log(`Three-pc kurtis API returned status: ${threePcKurtiRes.status}`)
        }

        console.log(`Fetching petticoat kurtis for product ID: ${data._id}`)
        const petticoatKurtiRes = await fetch(`/api/admin/petticoat-kurtis?parentId=${data._id}`)
        if (petticoatKurtiRes.ok) {
          const petticoatKurtiData = await petticoatKurtiRes.json()
          console.log(`Found ${petticoatKurtiData.length} petticoat kurtis:`, petticoatKurtiData)
          setPetticoatKurtis(petticoatKurtiData)
        } else {
          console.log(`Petticoat kurtis API returned status: ${petticoatKurtiRes.status}`)
        }
      }

      // Initialize states
      setSelectedImage(data.images[0] || null)
      setCurrentImageIndex(0)
      setCurrentPrice(data.price)
      if (data.variations && data.variations.length > 0) {
        setSelectedSize(data.variations[0].size)
        setSelectedColor(data.variations[0].color)
        setCurrentStock(data.variations[0].stock)
        if (data.variations[0].price_modifier !== undefined) {
          setCurrentPrice(data.price + data.variations[0].price_modifier)
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const matchingVariation = product.variations.find((v) => v.size === selectedSize && v.color === selectedColor)
      if (matchingVariation) {
        setCurrentStock(matchingVariation.stock)
        setCurrentPrice(product.total_price + (matchingVariation.price_modifier || 0))
      } else {
        setCurrentStock(0)
        setCurrentPrice(product.total_price)
      }
    }
  }, [selectedSize, selectedColor, product])

  const uniqueSizes = product ? Array.from(new Set(product.variations.map((v) => v.size))) : []
  const uniqueColors = product ? Array.from(new Set(product.variations.map((v) => v.color))) : []

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Please select options",
        description: "Please select size and color before adding to cart",
        variant: "destructive",
      })
      return
    }

    if (currentStock === 0) {
      toast({
        title: "Out of stock",
        description: "This product variation is currently out of stock",
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const productForCart = {
        _id: product!._id,
        name: product!.name,
        price: currentPrice,
        total_price: product.total_price,
        oldPrice: product!.oldPrice,
        discount: product!.discount,
        images: product!.images,
        slug: product!.slug,
        rating: product!.rating,
        selectedSize,
        selectedColor,
        stock: currentStock,
      }

      await addToCart(productForCart)

      toast({
        title: "Added to cart!",
        description: `${product!.name} (${selectedSize}, ${selectedColor}) has been added to your cart`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return <ProductError onRetry={fetchProduct} />
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            <div
              className="relative aspect-square rounded-xl overflow-hidden group cursor-zoom-in"
              onClick={() => {
                const item = galleryItems[currentImageIndex]
                if (item?.type === "image") setIsModalOpen(true)
              }}
            >
              {galleryItems[currentImageIndex]?.type === "video" && instagramEmbedUrl ? (
                <div className="relative w-full h-full bg-black">
                  <iframe
                    src={instagramEmbedUrl}
                    className="w-full h-full"
                    title="Instagram video"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <Image
                    src={getImageUrl(selectedImage) || "/placeholder.svg?height=600&width=600" || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                    priority
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-3">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
                  No Media Available
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
              </button>

              <button
                onClick={nextImage}
                disabled={currentImageIndex === totalGallery - 1}
                className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
              </button>

              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 px-8 md:px-0 scrollbar-hide">
                {galleryItems.map((item, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:scale-105"
                    }`}
                    onClick={() => goToImage(index)}
                    aria-label={item.type === "video" ? "Instagram video" : `Thumbnail ${index + 1}`}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-black text-white text-xs flex items-center justify-center">
                        Video
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={getImageUrl(item.src) || "/placeholder.svg?height=80&width=80" || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-3">
                {galleryItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-base md:text-lg lg:text-[18px] font-bold text-gray-900 mb-2 md:mb-3">
                {product.name}
              </h1>

              {product.rating !== undefined && (
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 md:w-5 md:h-5 ${
                          i < product.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-gray-600">({product.rating}/5)</span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              {product.oldPrice && (
                <p className="text-sm md:text-base text-gray-500">
                  MRP: <span className="line-through">₹{product.oldPrice.toLocaleString()}</span>
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-red-600">
                  ₹{Number(roundTotalPrice(product.total_price || currentPrice || product.price).toFixed(2))}
                </span>

                {product.discount && (
                  <span className="bg-red-100 text-red-800 text-xs md:text-sm font-medium px-2 py-1 rounded-full">
                    {product.discount}
                  </span>
                )}
              </div>
            </div>

            {/* Product Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="size-select" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Size
                  </Label>
                  <Select value={selectedSize || ""} onValueChange={setSelectedSize}>
                    <SelectTrigger id="size-select" className="bg-white h-9 md:h-10 text-sm">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {uniqueSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color-select" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Color
                  </Label>
                  <Select value={selectedColor || ""} onValueChange={setSelectedColor}>
                    <SelectTrigger id="color-select" className="bg-white h-9 md:h-10 text-sm">
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Stock Information */}
            {currentStock !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600">Stock:</span>
                <span
                  className={`text-xs md:text-sm font-semibold ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {currentStock > 0 ? `${currentStock} available` : "Out of Stock"}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 md:gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={currentStock === 0 || isAddingToCart}
                className="flex-1 bg-teal-800 hover:bg-teal-700 text-white py-2.5 md:py-3 text-sm md:text-base"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            {/* Why Choose Section */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">
                Why Choose This Product?
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base text-gray-700">Premium Quality Materials</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base text-gray-700">Stylish and Modern Design</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base text-gray-700">Durable and Long-lasting</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm lg:text-base text-gray-700">Great Value for Money</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Information Sections - Sequential Layout (No Tabs) */}
        <div className="mt-8 md:mt-12 space-y-6 md:space-y-8 shadow-sm">
          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Package className="h-4 w-4 md:h-5 md:w-5" />
                Product Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 md:mb-6">
                  {product.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="font-semibold text-sm md:text-base text-gray-800">Key Features:</h4>
                    <ul className="space-y-2 text-xs md:text-sm lg:text-base text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        High-quality fabric construction
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        Comfortable and breathable material
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        Easy care and maintenance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        Perfect for all occasions
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="font-semibold text-sm md:text-base text-gray-800">Care Instructions:</h4>
                    <ul className="space-y-2 text-xs md:text-sm lg:text-base text-gray-600">
                      <li>• Machine wash cold with like colors</li>
                      <li>• Do not bleach</li>
                      <li>• Tumble dry low heat</li>
                      <li>• Iron on low temperature if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3pc Lehenga Section */}
          {threePcLehengas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  3pc Lehenga Details
                </CardTitle>
                <CardDescription>
                  Detailed specifications for the 3pc lehengas available for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {threePcLehengas.map((lehenga, index) => (
                    <div key={lehenga._id} className=" rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Design Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Design Code:</span> {lehenga.designCode}
                            </p>
                            <p>
                              <span className="font-medium">Design Name:</span> {lehenga.designName}
                            </p>
                            <p>
                              <span className="font-medium">Type:</span> {lehenga.lehngaType}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {lehenga.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Fabric Details</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Fabric Type:</span> {lehenga.fabricType}
                            </p>
                            <p>
                              <span className="font-medium">Blouse:</span> {lehenga.blouseFabric}
                            </p>
                            <p>
                              <span className="font-medium">Skirt:</span> {lehenga.skirtFabric}
                            </p>
                            <p>
                              <span className="font-medium">Dupatta:</span> {lehenga.dupattaFabric}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Stitching & Details</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Blouse Stitching:</span> {lehenga.blouseStitching}
                            </p>
                            <p>
                              <span className="font-medium">Skirt Stitching:</span> {lehenga.skirtStitching}
                            </p>
                            <p>
                              <span className="font-medium">Work & Print:</span> {lehenga.workAndPrint}
                            </p>
                            <p>
                              <span className="font-medium">Manufacturer:</span> {lehenga.lehengaManufacturer}
                            </p>
                            {lehenga.hasKenken && (
                              <Badge variant="secondary" className="mt-2">
                                Has Kenken
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blouse Section */}
          {blouses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Blouse Details
                </CardTitle>
                <CardDescription>Detailed specifications for the blouses available for this product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {blouses.map((blouse, index) => (
                    <div key={blouse._id} className="rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Financial Year:</span> {blouse.financialYear}
                            </p>
                            <p>
                              <span className="font-medium">Wholesaler:</span> {blouse.wholesalerId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Fabric Type:</span> {blouse.fabricType}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {blouse.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Design & Work</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Work & Print:</span> {blouse.workAndPrint}
                            </p>
                            <p>
                              <span className="font-medium">Manufacturer:</span> {blouse.blouseManufacturer}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Measurements</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Bust Size:</span> {blouse.bustSize}
                            </p>
                            <p>
                              <span className="font-medium">Blouse Length:</span> {blouse.blouseLength}
                            </p>
                            <p>
                              <span className="font-medium">Sleeve Length:</span> {blouse.sleeveLength}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* One-Pc Kurti Section */}
          {onePcKurtis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  One-Pc Kurti Details
                </CardTitle>
                <CardDescription>
                  Detailed specifications for the one-pc kurtis available for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {onePcKurtis.map((kurti, index) => (
                    <div key={kurti._id} className="rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Financial Year:</span> {kurti.financialYear}
                            </p>
                            <p>
                              <span className="font-medium">Wholesaler:</span> {kurti.wholesalerId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Fabric Type:</span> {kurti.kurtiFabricType}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {kurti.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Design & Work</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Work:</span> {kurti.work}
                            </p>
                            <p>
                              <span className="font-medium">Manufacturer:</span> {kurti.kurtiManufacturer}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Measurements</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Bust Size:</span> {kurti.bustSize}
                            </p>
                            <p>
                              <span className="font-medium">Kurti Length:</span> {kurti.kurtiLength}
                            </p>
                            <p>
                              <span className="font-medium">Sleeve Length:</span> {kurti.sleeveLength}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Two-Pc Kurti Section */}
          {twoPcKurtis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Two-Pc Kurti Details
                </CardTitle>
                <CardDescription>
                  Detailed specifications for the two-pc kurtis available for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {twoPcKurtis.map((kurti, index) => (
                    <div key={kurti._id} className="rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Financial Year:</span> {kurti.financialYear}
                            </p>
                            <p>
                              <span className="font-medium">Wholesaler:</span> {kurti.wholesalerId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Fabric Type:</span> {kurti.kurtiFabricType}
                            </p>
                            <p>
                              <span className="font-medium">Pattern:</span> {kurti.pattern}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {kurti.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Design & Work</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Work:</span> {kurti.work}
                            </p>
                            <p>
                              <span className="font-medium">Manufacturer:</span> {kurti.kurtiManufacturer}
                            </p>
                            {kurti.stretchable && (
                              <Badge variant="secondary" className="mt-2">
                                Stretchable
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Measurements</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Bust Size:</span> {kurti.bustSize}
                            </p>
                            <p>
                              <span className="font-medium">Kurti Length:</span> {kurti.kurtiLength}
                            </p>
                            <p>
                              <span className="font-medium">Sleeve Length:</span> {kurti.sleeveLength}
                            </p>
                            <p>
                              <span className="font-medium">Pant Length:</span> {kurti.pantLength}
                            </p>
                            <p>
                              <span className="font-medium">Pant Waist:</span> {kurti.pantWaistSize}
                            </p>
                            <p>
                              <span className="font-medium">Pant Hip:</span> {kurti.pantHipSize}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Three-Pc Kurti Section */}
          {threePcKurtis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Three-Pc Kurti Details
                </CardTitle>
                <CardDescription>
                  Detailed specifications for the three-pc kurtis available for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {threePcKurtis.map((kurti, index) => (
                    <div key={kurti._id} className=" rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Financial Year:</span> {kurti.financialYear}
                            </p>
                            <p>
                              <span className="font-medium">Wholesaler:</span> {kurti.wholesalerId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Fabric Type:</span> {kurti.kurtiFabricType}
                            </p>
                            <p>
                              <span className="font-medium">Pattern:</span> {kurti.pattern}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {kurti.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Design & Work</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Work:</span> {kurti.work}
                            </p>
                            <p>
                              <span className="font-medium">Manufacturer:</span> {kurti.kurtiManufacturer}
                            </p>
                            {kurti.stretchable && (
                              <Badge variant="secondary" className="mt-2">
                                Stretchable
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Measurements</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Bust Size:</span> {kurti.bustSize}
                            </p>
                            <p>
                              <span className="font-medium">Kurti Length:</span> {kurti.kurtiLength}
                            </p>
                            <p>
                              <span className="font-medium">Sleeve Length:</span> {kurti.sleeveLength}
                            </p>
                            <p>
                              <span className="font-medium">Pant Length:</span> {kurti.pantLength}
                            </p>
                            <p>
                              <span className="font-medium">Pant Waist:</span> {kurti.pantWaistSize}
                            </p>
                            <p>
                              <span className="font-medium">Pant Hip:</span> {kurti.pantHipSize}
                            </p>
                            <p>
                              <span className="font-medium">Dupatta Length:</span> {kurti.dupattaLength}
                            </p>
                            <p>
                              <span className="font-medium">Dupatta Width:</span> {kurti.dupattaWidth}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Petticoat Kurti Section */}
          {petticoatKurtis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Petticoat Kurti Details
                </CardTitle>
                <CardDescription>
                  Detailed specifications for the petticoat kurtis available for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {petticoatKurtis.map((kurti, index) => (
                    <div key={kurti._id} className=" rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Financial Year:</span> {kurti.financialYear}
                            </p>
                            <p>
                              <span className="font-medium">Wholesaler:</span> {kurti.wholesalerId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Fabric Type:</span> {kurti.petticoatFabricType}
                            </p>
                            <p>
                              <span className="font-medium">Quantity:</span> {kurti.quantity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Design & Work</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Work:</span> {kurti.work}
                            </p>
                            <p>
                              <span className="font-medium">Manufacturer:</span> {kurti.manufacturer}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Measurements</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Waist Size:</span> {kurti.waistSize}
                            </p>
                            <p>
                              <span className="font-medium">Petticoat Length:</span> {kurti.petticoatLength}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="mt-5 pt-0 mb-10 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 mb-6 md:mb-8">Related Products</h2>
          {Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
            <div className="relative">
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 md:p-2 hover:bg-gray-50 transition-colors"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 md:p-2 hover:bg-gray-50 transition-colors"
                    disabled={currentSlide === totalSlides - 1}
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </button>
                </>
              )}

              <div className="overflow-hidden mx-6 md:mx-8">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
                  }}
                >
                  {(Array.isArray(relatedProducts) ? relatedProducts : []).map((relatedProduct) => (
                    <div
                      key={relatedProduct._id}
                      className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2 md:px-3"
                    >
                      <div className="group cursor-pointer rounded-sm hover:shadow-md transition-shadow duration-300 p-3 md:p-4">
                        <div className="overflow-hidden rounded-lg bg-gray-100 mb-4 md:mb-8 relative h-[300px] sm:h-[400px] md:h-[500px] w-full">
                          <Image
                            src={
                              getImageUrl(relatedProduct.images[0]) ||
                              "/placeholder.svg?height=500&width=300&query=" +
                                encodeURIComponent(relatedProduct.name) ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={relatedProduct.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `/placeholder.svg?height=500&width=300&query=${encodeURIComponent(
                                relatedProduct.name,
                              )}`
                            }}
                          />
                        </div>

                        <div onClick={() => router.push(`/products/${relatedProduct.slug}`)}>
                          <div className="flex items-center mb-2 text-orange-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 md:w-4 md:h-4 ${
                                  i < Math.floor(relatedProduct.rating || 0) ? "fill-current" : "text-orange-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs md:text-sm text-gray-600">
                              ({relatedProduct.rating || 0})
                            </span>
                          </div>

                          <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedProduct.name}
                          </h3>

                          <div className="mb-2">
                            {relatedProduct.oldPrice && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500">MRP:</span>
                                <span className="line-through text-gray-500 text-xs md:text-sm">
                                  ₹{relatedProduct.oldPrice.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <p className="text-base md:text-lg font-semibold text-red-600">
                              ₹{(relatedProduct.total_price || relatedProduct.price).toLocaleString()}
                            </p>
                          </div>

                          {relatedProduct.oldPrice &&
                            relatedProduct.oldPrice > (relatedProduct.total_price || relatedProduct.price) && (
                              <div className="mb-2">
                                <span className="text-green-600 text-xs md:text-sm font-medium">
                                  Save ₹
                                  {(
                                    relatedProduct.oldPrice - (relatedProduct.total_price || relatedProduct.price)
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}

                          <div className="mt-2">
                            <span className="text-gray-600 text-xs font-medium">
                              {relatedProduct.variations && relatedProduct.variations.length > 0
                                ? `${relatedProduct.variations.reduce(
                                    (total: number, variation: any) => total + (variation.stock || 0),
                                    0,
                                  )} items in stock`
                                : "In Stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Indicators */}
              {totalSlides > 1 && (
                <div className="flex justify-center mt-4 md:mt-6 space-x-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm md:text-base text-gray-500">No related products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
     
     
   
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 md:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-2 md:top-4 right-2 md:right-4 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 md:p-3 transition-colors"
            aria-label="Close image zoom"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          {galleryItems.length > 1 && (
            <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm bg-black/30">
              {currentImageIndex + 1} / {galleryItems.length}
            </div>
          )}

          {/* Navigation buttons */}
          {galleryItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 md:p-3 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 md:p-3 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </button>
            </>
          )}

          {/* Main modal image wrapper */}
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {galleryItems[currentImageIndex]?.type === "image" && selectedImage && (
              <Image
                src={
                  getImageUrl(selectedImage) ||
                  "/placeholder.svg?height=1600&width=1600&query=product%20image" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                }
                alt={product?.name || "Product image"}
                width={1600}
                height={1600}
                className="w-full h-auto max-h-[90vh] object-contain"
                priority
              />
            )}
            {galleryItems[currentImageIndex]?.type === "video" && (
              <div className="text-white text-xs md:text-sm">Video cannot be zoomed. Use the main view.</div>
            )}
          </div>

          {/* Modal thumbnail navigation */}
          {galleryItems.length > 1 && (
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex gap-1.5 md:gap-2 bg-black/50 rounded-full p-1.5 md:p-2 max-w-[90vw] overflow-x-auto scrollbar-hide">
                {galleryItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-white ring-2 ring-white/50"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-black text-white text-[10px] flex items-center justify-center">
                        Video
                      </div>
                    ) : (
                      <Image
                        src={getImageUrl(item.src) || "/placeholder.svg?height=48&width=48" || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
