import connectDB from "@/app/lib/mongodb";
import { Brand } from "@/app/lib/model";
import { User } from "@/app/lib/models";
import Blog from "@/app/lib/models/blog";
import ContactSubmission from "@/app/lib/models/ContactSubmission";
import { Product } from "@/app/lib/models/product";
import { Category } from "@/app/lib/models/category";
import { isValidObjectId } from "mongoose";

function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export async function getStats() {
  await connectDB();
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalBlogs,
     totalProducts,
    totalCategories,
    totalBrands,
    totalContactSubmission,
    totalUsers,
    newBlogs,
    newBrands,
      newProducts,
    newCategories,
  
  ] = await Promise.all([
    Blog.countDocuments(),
    Brand.countDocuments(),
    Product.countDocuments({}),
    Category.countDocuments({}),
    ContactSubmission.countDocuments(),
    User.countDocuments(),
    Blog.countDocuments({ createdAt: { $gte: last30Days } }),
     Product.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Category.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Brand.countDocuments({ createdAt: { $gte: last30Days } }),
    ContactSubmission.countDocuments({ createdAt: { $gte: last30Days } }),
    User.countDocuments({ createdAt: { $gte: last30Days } }),
  ]);

  return {
      totalProducts,
    totalCategories,
    totalBlogs,
    totalBrands,
    totalContactSubmission,
    totalUsers,
    newBlogs,
    newBrands,
    newProducts,
    newCategories,
    
  };
}

export async function getBrands({ page = 1, per_page = 10, name = "" }) {
  await connectDB();
  const skip = (page - 1) * per_page;
  const query: any = name ? { name: { $regex: name, $options: "i" } } : {};

  const [brands, total] = await Promise.all([
    Brand.find(query).sort({ createdAt: -1 }).skip(skip).limit(per_page).lean(),
    Brand.countDocuments(query),
  ]);

  return {
    brands: serialize(brands),
    totalPages: Math.ceil(total / per_page),
  };
}

export async function getBrandById(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const brand = await Brand.findById(id).lean();
  return brand ? serialize(brand) : null;
}
// Update the getCategories function to handle name and parent_id filters
export async function getCategories({ page = 1, per_page = 10, name = "", parent_id = "" }) {
  await connectDB()

  const skip = (page - 1) * per_page

  // Build query based on filters
  const query: any = {}
  if (name) {
    query.name = { $regex: name, $options: "i" }
  }

  if (parent_id) {
    if (parent_id === "none") {
      query.parent_category_id = null
    } else {
      query.parent_category_id = parent_id
    }
  }

  const [categories, totalCategories] = await Promise.all([
    Category.find(query)
      .populate("parent_category_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per_page)
      .lean(),
    Category.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalCategories / per_page)

  return {
    categories: serialize(categories),
    totalPages,
  }
}

// Get category by ID
export async function getCategoryById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectDB()

  const category = await Category.findById(id).populate("parent_category_id", "name").lean()

  return category ? serialize(category) : null
}

// Update the getProducts function to handle all filters
export async function getProducts({ page = 1, per_page = 10, name = "", brand_id = "", category_id = "", date = "" }) {
  await connectDB()

  const skip = (page - 1) * per_page

  // Build query based on filters
  const query: any = {}

  if (name) {
    query.name = { $regex: name, $options: "i" }
  }

  if (brand_id) {
    query.brand_id = brand_id
  }

  if (category_id) {
    query.category_id = category_id
  }

  if (date) {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    }
  }

  const [products, totalProducts] = await Promise.all([
    Product.find(query)
      .populate("brand_id", "name")
      .populate("category_id", "name")
      .populate({
        path: "variations",
        select: "image gallery",
        options: { limit: 1 }, // Get only the first variation for the image
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per_page)
      .lean(),
    Product.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalProducts / per_page)

  return {
    products: serialize(products),
    totalPages,
  }
}

// Get product by ID
export async function getProductById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectDB()

  const product = await Product.findById(id).populate("brand_id", "name").populate("category_id", "name").lean()

  return product ? serialize(product) : null
}

export async function getUsers({
  page = 1,
  per_page = 10,
  name = "",
  email = "",
}) {
  await connectDB();
  const skip = (page - 1) * per_page;
  const query: any = {};
  if (name) query.name = { $regex: name, $options: "i" };
  if (email) query.email = { $regex: email, $options: "i" };

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per_page)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users: serialize(users),
    totalPages: Math.ceil(total / per_page),
  };
}

export async function getUserById(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const user = await User.findById(id).select("-password").lean();
  return user ? serialize(user) : null;
}
