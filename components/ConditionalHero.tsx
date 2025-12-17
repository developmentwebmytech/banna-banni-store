"use client"

import { usePathname } from "next/navigation"
import HomePage from "./Hero"

export default function ConditionalHero() {
  const pathname = usePathname()

  // Define pages where hero should NOT be shown
  const excludedPaths = [
    "/terms",
    "/privacypolicy",
     "/stitchingpolicy",
    "/cancel",
    "/medicine",
    "/communication",
    "/faq",
    "/contact",
    "/about",
    "/login",
    "/register",
    "/products", // Products listing page
    "/blogs", // Blog listing page
    "/cart",
    "/forgot-password",
    "/reset-password", // ✅ Added to hide hero on reset password page
    "/account/profile",
    "/wishlist",
    "/account/orders",
    "/account/payment-methods",
    "/account/payment-methods/new",
    "/account/addresses",
    "/account/addresses/new",
    "/howwork",
    "/company",
    "/support",
    "/locate",
    "/dashboard",
    "/dashboard/users",
    "/dashboard/contact",
    "/signin",
    "/checkout",
    "/order-success",
    "/newarrival",
    "/trending",
    "/topproduct",
    "/",
    "/returnrefund",
    "/Shipping",
    "/Terms"
  ]

  // Define path patterns where hero should NOT be shown
  const excludedPatterns = [
    /^\/products\/by-slug\/[^/]+$/, // Product detail pages: /products/by-slug/[slug]
    /^\/blog\/by-slug\/[^/]+$/, // Blog detail pages: /blog/by-slug/[slug]
    /^\/blogdetail/, // Any old blog detail page
    /^\/category\d+$/, // Category pages: /category1, /category2, etc.
    /^\/productdetail\d+$/, // Product detail pages: /productdetail1, etc.
    /^\/dashboard\//, // Any dashboard sub-page
    /^\/account\//, // Any account sub-page
     /^\/newarrival\/[^/]+$/, // Blog detail pages: /blog/by-slug/[slug]
       /^\/trending\/[^/]+$/, 
        /^\/bestseller\/[^/]+$/, 
          /^\/aboutus\/[^/]+$/, 
           /^\/testimonials\/[^/]+$/,
           /^\/shopbycategory\/[^/]+$/, 
     /^\/dashboard\/newarrival\/detail\/[^/]+$/,
      /^\/hero\/[^/]+$/,
       /^\/categories\/[^/]+$/,
         /^\/topproduct\/[^/]+$/,
            /^\/products\/[^/]+$/,
            /^\/blogs\/[^/]+$/,
             /^\/category\/[^/]+$/,
              /^\/[^/]+$/,
            
     
  ]

  // Check if current path should exclude hero
  const shouldExcludeHero =
    excludedPaths.includes(pathname) || excludedPatterns.some((pattern) => pattern.test(pathname))

  // If hero should be excluded, return null
  if (shouldExcludeHero) {
    return null
  }

  // Otherwise, show the hero
  return <HomePage />
}
