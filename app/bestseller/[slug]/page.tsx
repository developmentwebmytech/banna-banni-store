"use client"

import Image from "next/image"
import { Star, RefreshCw, ShoppingCart, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useCart } from "@/components/context/CartContext"
import { useToast } from "@/app/hooks/use-toast"

// Create a plain data type without Mongoose methods
type BestSellerProductData = {
  _id: string
  title: string
  images: string[]
  description: string
  category: string
  price: number
  mrp: number
  discount: string
  ratings: number
  slug: string
  variations: IBestSellerVariation[]
  createdAt: Date
  updatedAt: Date
}

interface IBestSellerVariation {
  color: string
  size: string
  stock: number
  sku?: string
  price_modifier?: number // Added price_modifier to variations
}

// Sample product data for fallback (kept local as requested)
const sampleProduct: BestSellerProductData = {
  _id: "sample-bestseller-product",
  title: "Best Selling Designer Collection",
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  description:
    "Our best-selling designer collection featuring premium quality fabric and exquisite craftsmanship. Perfect for weddings, festivals, and special occasions. This stunning piece combines traditional elegance with contemporary style.",
  category: "Designer Wear",
  price: 6999,
  mrp: 15999,
  discount: "56% OFF",
  ratings: 4.7,
  slug: "best-selling-designer-collection",
  variations: [
    { color: "Red", size: "S", stock: 5, price_modifier: 0 },
    { color: "Red", size: "M", stock: 12, price_modifier: 50 },
    { color: "Red", size: "L", stock: 8, price_modifier: 100 },
    { color: "Blue", size: "S", stock: 7, price_modifier: 0 },
    { color: "Blue", size: "M", stock: 15, price_modifier: 50 },
    { color: "Blue", size: "L", stock: 6, price_modifier: 100 },
    { color: "Green", size: "S", stock: 0, price_modifier: 0 }, // Out of stock example
    { color: "Green", size: "M", stock: 3, price_modifier: 50 },
    { color: "Green", size: "L", stock: 9, price_modifier: 100 },
    { color: "Pink", size: "S", stock: 11, price_modifier: 0 },
    { color: "Pink", size: "M", stock: 18, price_modifier: 50 },
    { color: "Pink", size: "L", stock: 4, price_modifier: 100 },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Client component for interactive functionality
function BestSellerProductDetailClient({ slug }: { slug: string }) {
  const { addToCart } = useCart() // Initialize useCart hook
  const { toast } = useToast() // Initialize useToast hook

  const [product, setProduct] = useState<BestSellerProductData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<string>("1")
  const [mainImage, setMainImage] = useState<string>("")
  const [isAddingToCart, setIsAddingToCart] = useState(false) // Add to cart loading state
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // Added carousel state
  const [isModalOpen, setIsModalOpen] = useState(false) // Added modal state for zoom lightbox

  // Helper function to get image source with fallback (kept local as requested)
  const getImageSrc = (imageSrc: string, alt = "product image") => {
    if (!imageSrc) {
      return `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(alt)}`
    }

    if (imageSrc.includes("placeholder.svg") || imageSrc.startsWith("/") || imageSrc.startsWith("http")) {
      return imageSrc
    }

    return `/${imageSrc}`
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(`Fetching bestseller product with slug: ${slug}`)
        const response = await fetch(`/api/bestseller/${slug}`)

        if (!response.ok) {
          console.warn("Bestseller API failed, using sample product")
          // Use sample product with the requested slug
          setProduct({ ...sampleProduct, slug: slug })
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setProduct(data)

        if (data.images && data.images.length > 0) {
          setMainImage(getImageSrc(data.images[0], data.title))
        } else {
          setMainImage(`/placeholder.svg?height=600&width=600&query=${encodeURIComponent(data.title)}`)
        }

        // Set default selected color and size if variations exist
        if (data.variations && data.variations.length > 0) {
          // Find the first variation with stock > 0 to set as default
          const inStockVariations = data.variations.filter((v: IBestSellerVariation) => v.stock > 0)
          const defaultVariation = inStockVariations.length > 0 ? inStockVariations[0] : data.variations[0]
          setSelectedColor(defaultVariation.color)
          setSelectedSize(defaultVariation.size)
        }
      } catch (err: any) {
        console.warn("Bestseller API error, using sample product:", err.message)
        setError(err.message)
        // Use sample product as fallback
        setProduct({ ...sampleProduct, slug: slug })

        // Set up sample product defaults
        setMainImage(getImageSrc(sampleProduct.images[0], sampleProduct.title))
        if (sampleProduct.variations && sampleProduct.variations.length > 0) {
          const inStockVariations = sampleProduct.variations.filter((v) => v.stock > 0)
          const defaultVariation = inStockVariations.length > 0 ? inStockVariations[0] : sampleProduct.variations[0]
          setSelectedColor(defaultVariation.color)
          setSelectedSize(defaultVariation.size)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  // Get unique colors from all variations
  const uniqueColors = product ? Array.from(new Set(product.variations.map((v) => v.color))) : []

  // Get unique sizes for the currently selected color
  const uniqueSizesForSelectedColor =
    product && selectedColor
      ? Array.from(new Set(product.variations.filter((v) => v.color === selectedColor).map((v) => v.size)))
      : []

  // Get stock for the currently selected color and size
  const currentVariation = product?.variations.find((v) => v.color === selectedColor && v.size === selectedSize)
  const currentStock = currentVariation?.stock || 0
  const currentPriceModifier = currentVariation?.price_modifier || 0 // Get price modifier

  // Reset size if selected color changes and the current size is not available for the new color
  useEffect(() => {
    if (
      selectedColor &&
      uniqueSizesForSelectedColor.length > 0 &&
      !uniqueSizesForSelectedColor.includes(selectedSize)
    ) {
      // Find first available size for the selected color with stock > 0
      const availableSize = uniqueSizesForSelectedColor.find((size) => {
        const variation = product?.variations.find((v) => v.color === selectedColor && v.size === size)
        return variation && variation.stock > 0
      })
      setSelectedSize(availableSize || uniqueSizesForSelectedColor[0])
    }
  }, [selectedColor, selectedSize, uniqueSizesForSelectedColor, product?.variations])

  // Update quantity when stock changes
  useEffect(() => {
    if (currentStock > 0 && Number.parseInt(selectedQuantity) > currentStock) {
      setSelectedQuantity("1")
    }
  }, [currentStock, selectedQuantity])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      if (e.key === "Escape") {
        setIsModalOpen(false)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevImage()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        nextImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  const handleAddToCart = async () => {
    if (!product) return

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

    setIsAddingToCart(true) // Start loading

    try {
      const finalPrice = product.price + currentPriceModifier

      // Create product object with selected variations for cart
      const productForCart = {
        _id: product._id,
        name: product.title, // Map title to name
        price: finalPrice, // Use current price with variation modifier
        oldPrice: product.mrp, // Map mrp to oldPrice
        discount: product.discount,
        images: product.images,
        slug: product.slug,
        rating: product.ratings, // Map ratings to rating
        selectedSize,
        selectedColor,
        stock: currentStock,
        quantity: Number.parseInt(selectedQuantity),
      }

      await addToCart(productForCart) // Add to cart using the context function

      toast({
        title: "Added to cart!",
        description: `${product.title} (${selectedSize}, ${selectedColor}) has been added to your cart`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false) // End loading
    }
  }

  const nextImage = () => {
    if (product?.images) {
      const nextIndex = (currentImageIndex + 1) % product.images.length
      setCurrentImageIndex(nextIndex)
      setMainImage(getImageSrc(product.images[nextIndex], product.title))
    }
  }

  const prevImage = () => {
    if (product?.images) {
      const prevIndex = currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(prevIndex)
      setMainImage(getImageSrc(product.images[prevIndex], product.title))
    }
  }

  const goToImage = (index: number) => {
    if (product?.images) {
      setCurrentImageIndex(index)
      setMainImage(getImageSrc(product.images[index], product.title))
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-500">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-4 lg:p-6 text-center text-red-500 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p>Error: {error || "Product not found."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-800">Note: Using sample data due to API issues</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT - Product Images */}
        <div className="space-y-4">
          {/* Main Image with zoom lightbox */}
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden group">
            <button
              className="product__media-toggle quick-add-hidden product__media-zoom-lightbox absolute inset-0 z-10 cursor-zoom-in"
              type="button"
              aria-haspopup="dialog"
              data-media-id="24629779365984"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="visually-hidden sr-only">Open media 1 in modal</span>
            </button>

            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.title)}`
              }}
            />

            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center pointer-events-none">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((imgSrc, index) => {
                const thumbnailSrc = getImageSrc(imgSrc, `${product.title} view ${index + 1}`)
                return (
                  <button
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => goToImage(index)}
                  >
                    <Image
                      src={thumbnailSrc || "/placeholder.svg"}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(product.title + " thumbnail")}`
                      }}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT - Product Details */}
        <div className="space-y-6">
          {/* Product Title and Rating */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.ratings) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm text-gray-500">({product.ratings}/5)</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="text-sm text-gray-500">
              MRP: <span className="line-through">₹{product.mrp.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-red-600">
                ₹{(product.price + currentPriceModifier).toLocaleString()}
              </span>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">20% off</span>
            </div>
          </div>

          {/* Size Selection */}
          {uniqueSizesForSelectedColor.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {uniqueSizesForSelectedColor.map((size) => {
                    const sizeVariation = product.variations?.find((v) => v.color === selectedColor && v.size === size)
                    const sizeHasStock = sizeVariation && sizeVariation.stock > 0
                    return (
                      <SelectItem key={size} value={size} disabled={!sizeHasStock}>
                        {size} {!sizeHasStock && "(Out of Stock)"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Color Selection */}
          {uniqueColors.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {uniqueColors.map((color) => {
                    const colorHasStock = product.variations?.some((v) => v.color === color && v.stock > 0)
                    return (
                      <SelectItem key={color} value={color} disabled={!colorHasStock}>
                        {color} {!colorHasStock && "(Out of Stock)"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stock Status */}
          <div className="text-sm">
            <span className="font-medium">Stock: </span>
            {currentStock > 0 ? (
              <span className="text-green-600 font-medium">Available</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={currentStock === 0 || isAddingToCart}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>

          {/* Why Choose This Product */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Why Choose This Product?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">Premium Quality Materials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">Stylish and Modern Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">Durable and Long-lasting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">Great Value for Money</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12 pt-8">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold">📋</span>
            <h2 className="text-lg font-semibold">Product Description</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Purple Sequence</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-green-600">Key Features:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    High-quality fabric construction
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Comfortable and breathable material
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Easy care and maintenance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Perfect for all occasions
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Care Instructions:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Machine wash cold with like colors</li>
                  <li>• Do not bleach</li>
                  <li>• Tumble dry low heat</li>
                  <li>• Iron on low temperature if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-4xl max-h-4xl flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center text-white mb-4">
              <h3 className="text-lg font-medium">{product.title}</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {currentImageIndex + 1} / {product.images?.length || 1}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Image */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={mainImage || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-contain p-4"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=800&width=800&query=${encodeURIComponent(product.title)}`
                  }}
                />
              </div>

              {/* Navigation Buttons */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={currentImageIndex === product.images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((imgSrc, index) => {
                  const thumbnailSrc = getImageSrc(imgSrc, `${product.title} view ${index + 1}`)
                  return (
                    <div
                      key={index}
                      className={`relative h-16 w-16 flex-shrink-0 rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-white ring-2 ring-white ring-opacity-50"
                          : "border-white border-opacity-30 hover:border-opacity-60"
                      }`}
                      onClick={() => goToImage(index)}
                    >
                      <Image
                        src={thumbnailSrc || "/placeholder.svg"}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(product.title + " thumbnail")}`
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Main page component - now properly handles Next.js 15 async params
export default async function BestSellerProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  // Await the params as required by Next.js 15
  const { slug } = params

  return <BestSellerProductDetailClient slug={slug} />
}
