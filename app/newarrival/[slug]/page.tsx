"use client"

import Image from "next/image"
import { Star, RefreshCw, ShoppingCart, ChevronLeft, ChevronRight, X, ZoomIn, Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useCart } from "@/components/context/CartContext"
import { useToast } from "@/app/hooks/use-toast"
import { getImageUrl } from "@/app/lib/utils"

interface INewArrivalVariation {
  color: string
  size: string
  stock: number
  sku?: string
  price_modifier?: number
}

type NewArrivalProductData = {
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
  variations: INewArrivalVariation[]
  createdAt: Date
  updatedAt: Date
}

const sampleProduct: NewArrivalProductData = {
  _id: "purple-sequence-thread",
  title: "Purple Sequence Thread",
  images: ["/red-gold-indian-lehenga.png", "/red-lehenga-back-view.png", "/red-lehenga-detail.png"],
  description: "Purple Sequence",
  category: "Ethnic Wear",
  price: 4598,
  mrp: 4900,
  discount: "20% off",
  ratings: 4,
  slug: "purple-sequence-thread",
  variations: [
    { color: "Pink", size: "M", stock: 0, price_modifier: 0 }, // Out of stock to match reference
    { color: "Pink", size: "L", stock: 5, price_modifier: 0 },
    { color: "Pink", size: "XL", stock: 3, price_modifier: 0 },
    { color: "Red", size: "M", stock: 8, price_modifier: 0 },
    { color: "Red", size: "L", stock: 6, price_modifier: 0 },
    { color: "Red", size: "XL", stock: 4, price_modifier: 0 },
    { color: "Blue", size: "M", stock: 2, price_modifier: 50 },
    { color: "Blue", size: "L", stock: 7, price_modifier: 50 },
    { color: "Blue", size: "XL", stock: 5, price_modifier: 50 },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

function NewArrivalProductDetailClient({ slug }: { slug: string }) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [product, setProduct] = useState<NewArrivalProductData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>("Pink") // Updated default to Pink to match reference
  const [selectedSize, setSelectedSize] = useState<string>("M") // Updated default to M to match reference
  const [selectedQuantity, setSelectedQuantity] = useState<string>("1")
  const [mainImage, setMainImage] = useState<string>("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log(`Fetching new arrival product with slug: ${slug}`)
        const response = await fetch(`/api/newarrivals/${slug}`)

        if (!response.ok) {
          console.warn("NewArrival API failed, using sample product")
          setProduct({ ...sampleProduct, slug: slug })
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setProduct(data)
      } catch (err: any) {
        console.warn("NewArrival API error, using sample product:", err.message)
        setError(err.message)
        setProduct({ ...sampleProduct, slug: slug })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductData()
  }, [slug])

  useEffect(() => {
    if (!product) return

    setMainImage(getImageUrl(product.images[0] || "", product.title))

    if (product.variations && product.variations.length > 0) {
      const inStockVariations = product.variations.filter((v: INewArrivalVariation) => v.stock > 0)
      const defaultVariation = inStockVariations.length > 0 ? inStockVariations[0] : product.variations[0]

      setSelectedColor(defaultVariation.color)
      setSelectedSize(defaultVariation.size)
    }
  }, [product])

  // Initialize component state and set default selected color/size
  useEffect(() => {
    if (!product) return

    setMainImage(getImageUrl(product.images[0] || "", product.title))

    if (product.variations && product.variations.length > 0) {
      // Find the first variation with stock > 0 to set as default
      const inStockVariations = product.variations.filter((v: INewArrivalVariation) => v.stock > 0)
      const defaultVariation = inStockVariations.length > 0 ? inStockVariations[0] : product.variations[0]

      setSelectedColor(defaultVariation.color)
      setSelectedSize(defaultVariation.size)
    }
  }, [product])

  // Get unique colors from all variations
  const uniqueColors = product?.variations ? Array.from(new Set(product.variations.map((v) => v.color))) : []

  // Get unique sizes for the currently selected color
  const uniqueSizesForSelectedColor =
    product?.variations && selectedColor
      ? Array.from(new Set(product.variations.filter((v) => v.color === selectedColor).map((v) => v.size)))
      : []

  // Get stock for the currently selected color and size
  const currentVariation = product?.variations?.find((v) => v.color === selectedColor && v.size === selectedSize)
  const currentStock = currentVariation?.stock || 0
  const currentPriceModifier = currentVariation?.price_modifier || 0

  // Reset size if selected color changes and the current size is not available for the new color
  useEffect(() => {
    if (
      selectedColor &&
      uniqueSizesForSelectedColor.length > 0 &&
      !uniqueSizesForSelectedColor.includes(selectedSize)
    ) {
      // Find first available size for the selected color with stock > 0
      const availableSize = uniqueSizesForSelectedColor.find((size) => {
        const variation = product?.variations?.find((v) => v.color === selectedColor && v.size === size)
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
      setMainImage(getImageUrl(product.images[nextIndex], product.title))
    }
  }

  const prevImage = () => {
    if (product?.images) {
      const prevIndex = currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(prevIndex)
      setMainImage(getImageUrl(product.images[prevIndex], product.title))
    }
  }

  const goToImage = (index: number) => {
    if (product?.images) {
      setCurrentImageIndex(index)
      setMainImage(getImageUrl(product.images[index], product.title))
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-500">Loading product details...</p>
      </div>
    )
  }

  // Error state (should not happen now since we have fallback)
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
    <div className="bg-white min-h-screen">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center max-w-7xl mx-auto">
          <p className="text-yellow-800">Note: Using sample data due to API issues</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-50 group cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            >
              <Image
                src={mainImage || "/red-gold-indian-lehenga.png"}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-105"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.title)}`
                }}
              />
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="relative">
                <button
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={nextImage}
                  disabled={currentImageIndex === product.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>

                <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x transition-transform duration-300">
                  {product.images.map((imgSrc, index) => {
                    const thumbnailSrc = getImageUrl(imgSrc, `${product.title} view ${index + 1}`)
                    return (
                      <div
                        key={index}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-lg cursor-pointer overflow-hidden border-2 snap-start transition-all duration-300 bg-white group ${
                          index === currentImageIndex
                            ? "border-blue-500 ring-1 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => goToImage(index)}
                      >
                        <Image
                          src={
                            thumbnailSrc ||
                            `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(product.title + " thumbnail") || "/placeholder.svg"}`
                          }
                          alt={`${product.title} Thumbnail ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover p-1 transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(product.title + " thumbnail")}`
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  {product.images.map((_, index) => (
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
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-3">{product.title}</h1>

              {product.ratings !== undefined && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.ratings) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.ratings}/5)</span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                MRP: <span className="line-through">₹{product.mrp.toLocaleString()}</span>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  ₹{(product.price + currentPriceModifier).toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-1 rounded">
                  {product.discount}
                </span>
              </div>
            </div>

            {/* Size Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full bg-white border-gray-300 h-12">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {uniqueSizesForSelectedColor.map((size) => {
                      const sizeVariation = product.variations?.find(
                        (v) => v.color === selectedColor && v.size === size,
                      )
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

              {/* Color Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full bg-white border-gray-300 h-12">
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
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Stock:</span>
              {currentStock > 0 ? (
                <span className="text-green-600 font-medium text-sm">In Stock</span>
              ) : (
                <span className="text-red-600 font-medium text-sm">Out of Stock</span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={currentStock === 0 || isAddingToCart}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddingToCart ? "Adding..." : currentStock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>

            {/* Why Choose This Product */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Why Choose This Product?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Premium Quality Materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Stylish and Modern Design</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Durable and Long-lasting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">Great Value for Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <div className="w-5 h-5 border border-gray-400 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              Product Description
            </h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Key Features:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700">High-quality fabric construction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700">Comfortable and breathable material</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700">Easy care and maintenance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700">Perfect for all occasions</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Care Instructions:</h4>
                <ul className="space-y-2 text-gray-700">
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
                  src={mainImage || `/placeholder.svg?height=800&width=800&query=${encodeURIComponent(product.title)}`}
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
                  const thumbnailSrc = getImageUrl(imgSrc, `${product.title} view ${index + 1}`)
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
                        src={
                          thumbnailSrc ||
                          `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(product.title + " thumbnail") || "/placeholder.svg"}`
                        }
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

export default function NewArrivalProductDetailPage({ params }) {
  return <NewArrivalProductDetailClient slug={params.slug} />
}
