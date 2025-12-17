export type ProductData = {
  _id: string
  name: string
  description: string
  price: number
  oldPrice?: number
  discount?: string
  rating?: number
  images: string[]
  category_id: string
  brand_id?: string
  variations?: any[]
  slug: string
  createdAt: string
  updatedAt: string
}

// Fallback products in case API fails or returns empty
export const fallbackProducts: ProductData[] = [
  {
    _id: "fallback1",
    slug: "pastal-cream-color-sequence-thread-embroidery-lehenga",
    name: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    description: "Beautiful pastal cream lehenga with intricate sequence and thread embroidery work",
    images: ["/shopbycategory1.webp"],
    price: 4299,
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
    description: "Elegant purple lehenga with beautiful sequence and thread embroidery",
    images: ["/shopbycategory2.webp"],
    price: 4299,
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
    slug: "red-embroidary-lahenga",
    name: "Red Embroidary Lahenga",
    description: "Gorgeous red designer lehenga with premium quality fabric",
    images: ["/shopbycategory1.webp"],
    price: 4299,
    oldPrice: 11999,
    discount: "-44% OFF",
    rating: 4,
    category_id: "cat1",
    brand_id: "brand3",
    variations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
