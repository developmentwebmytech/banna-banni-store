import slugify from "slugify"

// Define a plain data interface for products (without Mongoose Document properties)
export interface IProductData {
  _id: string
  name: string
  description: string
  price: number
  oldPrice?: number
  discount?: string
  rating?: number // Made optional to match the incoming data
  images: string[]
  category_id: string
  brand_id: string
  variations: {
    size: string
    color: string
    stock: number
    price_modifier?: number // Made optional to match IProductVariation
  }[]
  slug: string
  createdAt: string
  updatedAt: string
}

// In-memory products store - this will persist during the session
let products: IProductData[] = [
  {
    _id: "fallback1",
    name: "Pastal Cream color Sequence Thread Embroidery Lehenga",
    description:
      "Beautiful pastal cream lehenga with intricate sequence and thread embroidery work. Perfect for special occasions and celebrations.",
    price: 4299,
    oldPrice: 11999,
    discount: "-75% OFF",
    rating: 4,
    images: ["/shopbycategory1.webp"],
    category_id: "cat1",
    brand_id: "brand1",
    variations: [
      { size: "S", color: "Cream", stock: 5, price_modifier: 0 },
      { size: "M", color: "Cream", stock: 8, price_modifier: 0 },
      { size: "L", color: "Cream", stock: 3, price_modifier: 500 },
    ],
    slug: "pastal-cream-lehenga",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "fallback2",
    name: "Purple Sequence Thread Embroidery Lehenga",
    description:
      "Elegant purple lehenga with beautiful sequence and thread embroidery. Designed for modern women who love traditional wear.",
    price: 4299,
    oldPrice: 11999,
    discount: "-64% OFF",
    rating: 4,
    images: ["/shopbycategory2.webp"],
    category_id: "cat1",
    brand_id: "brand2",
    variations: [
      { size: "S", color: "Purple", stock: 4, price_modifier: 0 },
      { size: "M", color: "Purple", stock: 6, price_modifier: 0 },
      { size: "L", color: "Purple", stock: 2, price_modifier: 500 },
    ],
    slug: "purple-sequence-lehenga",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "fallback3",
    name: "Pink Embroidery Lehenga",
    description:
      "Stunning pink lehenga with detailed embroidery work. Perfect blend of traditional craftsmanship and modern design.",
    price: 4299,
    oldPrice: 11999,
    discount: "-35% OFF",
    rating: 4,
    images: ["/shopbycategory3.webp"],
    category_id: "cat1",
    brand_id: "brand1",
    variations: [
      { size: "S", color: "Pink", stock: 7, price_modifier: 0 },
      { size: "M", color: "Pink", stock: 9, price_modifier: 0 },
      { size: "L", color: "Pink", stock: 4, price_modifier: 500 },
    ],
    slug: "pink-embroidery-lehenga",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "fallback4",
    name: "Red Designer Lehenga",
    description:
      "Gorgeous red designer lehenga with premium quality fabric and exquisite design work. Ideal for weddings and special events.",
    price: 4299,
    oldPrice: 11999,
    discount: "-44% OFF",
    rating: 4,
    images: ["/shopbycategory1.webp"],
    category_id: "cat1",
    brand_id: "brand3",
    variations: [
      { size: "S", color: "Red", stock: 3, price_modifier: 0 },
      { size: "M", color: "Red", stock: 5, price_modifier: 0 },
      { size: "L", color: "Red", stock: 2, price_modifier: 500 },
    ],
    slug: "red-designer-lehenga",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Helper functions for data manipulation
export const addProduct = (product: IProductData): IProductData => {
  products.push(product)
  return product
}

export const updateProduct = (id: string, updatedProduct: Partial<IProductData>): IProductData | null => {
  const index = products.findIndex((p) => p._id === id)
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct, updatedAt: new Date().toISOString() }
    return products[index]
  }
  return null
}

export const deleteProduct = (id: string): boolean => {
  console.log(`Attempting to delete product with ID: ${id}`)
  console.log(`Current products count: ${products.length}`)
  console.log(`Available IDs: ${products.map((p) => p._id).join(", ")}`)

  const initialLength = products.length
  products = products.filter((p) => p._id !== id)

  console.log(`After deletion, products count: ${products.length}`)
  return products.length < initialLength
}

export const getProductById = (id: string): IProductData | undefined => {
  console.log(`Looking for product with ID: ${id}`)
  console.log(`Available IDs: ${products.map((p) => p._id).join(", ")}`)

  const product = products.find((p) => p._id === id)
  console.log(`Found product: ${product ? "Yes" : "No"}`)
  return product
}

export const getProductBySlug = (slug: string): IProductData | undefined => {
  return products.find((p) => p.slug === slug)
}

export const getAllProducts = (): IProductData[] => {
  return products
}

export const createProduct = (
  productData: Omit<IProductData, "_id" | "slug" | "createdAt" | "updatedAt">,
): IProductData => {
  const newProduct: IProductData = {
    _id: `prod${Date.now()}`,
    ...productData,
    slug: slugify(productData.name, { lower: true, strict: true }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  products.push(newProduct)
  return newProduct
}
