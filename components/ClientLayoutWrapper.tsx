"use client";

import type React from "react";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ConditionalHero from "./ConditionalHero";
import AnimatedSection from "./AnimatedSection";
import { useEffect, useState } from "react";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Define exact static paths
  const staticHidePaths = new Set([
    "/dashboard",
    "/dashboard/settings/contact-address",
    "/dashboard/users",
    "/dashboard/contact",
    "/dashboard/faqs",
    "/dashboard/shipping",
    "/dashboard/reviews",
    "/dashboard/blogs/new",
    "/dashboard/announcements",
    "/dashboard/announcements/new",
    "/dashboard/orders",
    "/shop-manager-dashboard/orders",
    "/shop-manager-dashboard/coupons",
    "/shop-manager-dashboard/coupons/new",
    "/shop-manager-dashboard/brands",
    "/shop-manager-dashboard/brands/new",
    "/shop-manager-dashboard/categories",
    "/shop-manager-dashboard/categories/new",

    "/shop-manager-dashboard/products",
    "/shop-manager-dashboard/products/import-export",
    "/shop-manager-dashboard/products/new",
    "/shop-manager-dashboard/wholesalers",
    "/shop-manager-dashboard/wholesalers/new",
    "/shop-manager-dashboard/invoices",
    "/shop-manager-dashboard/invoices/new",
    "/shop-manager-dashboard/3pc-lehengas",
    "/shop-manager-dashboard/3pc-lehengas/new",
    "/shop-manager-dashboard/blouses",
    "/shop-manager-dashboard/blouses/new",
    "/shop-manager-dashboard/one-pc-kurtis",
    "/shop-manager-dashboard/one-pc-kurtis/new",
    "/shop-manager-dashboard/two-pc-kurtis",
    "/shop-manager-dashboard/two-pc-kurtis/new",
    "/shop-manager-dashboard/three-pc-kurtis",
    "/shop-manager-dashboard/three-pc-kurtis/new",
    "/shop-manager-dashboard/petticoat-kurtis",
    "/shop-manager-dashboard/petticoat-kurtis/new",

    "/dashboard/emails",
    "/dashboard/coupons",
    "/dashboard/coupons/new",
    "/dashboard/testimonials",
    "/dashboard/testimonials/new",
    "/dashboard/homepage",
    "/dashboard/homepage/new",
    "/dashboard/brands",
    "/dashboard/brands/new",
    "/dashboard/categories",
    "/dashboard/categories/new",
    "/dashboard/navcategories",
    "/dashboard/navcategories/new",
    "/dashboard/header-categories",
    "/dashboard/header-categories/new",
    "/dashboard/category",
    "/dashboard/products",
    "/dashboard/products/import-export",
    "/dashboard/products/new",
    "/dashboard/wholesalers",
    "/dashboard/wholesalers/new",
    "/dashboard/invoices",
    "/dashboard/invoices/new",
    "/dashboard/3pc-lehengas",
    "/dashboard/3pc-lehengas/new",
    "/dashboard/blouses",
    "/dashboard/blouses/new",
    "/dashboard/one-pc-kurtis",
    "/dashboard/one-pc-kurtis/new",
    "/dashboard/two-pc-kurtis",
    "/dashboard/two-pc-kurtis/new",
    "/dashboard/three-pc-kurtis",
    "/dashboard/three-pc-kurtis/new",
    "/dashboard/petticoat-kurtis",
    "/dashboard/petticoat-kurtis/new",
    "/signin",
    "/dashboard/blogs",
    "/market-manager-dashboard/blogs",
    "/market-manager-dashboard/blogs/new",
    "/dashboard/banners",
    "/dashboard/brand",
    "/dashboard/brand/new",
    "/dashboard/trustbadge",
    "/dashboard/trustbadge/new",
    "/dashboard/banners/new",
    "/dashboard/shopbycategory",
    "/dashboard/shopbycategory/new",
    "/dashboard/newarrivals",
    "/dashboard/newarrivals/new",
    "/dashboard/testimonials",
    "/dashboard/testimonials/new",
    "/dashboard/trending",
    "/dashboard/trending/new",
    "/dashboard/bestseller",
    "/dashboard/bestseller/new",
    "/dashboard/aboutus",
    "/dashboard/aboutus/new",
    "/dashboard/topproduct",
    "/dashboard/topproduct/new",
    "/dashboard/hero",
    "/dashboard/hero/new",
    "/dashboard/privacypolicy",
    "/dashboard/privacypolicy/new",
    "/dashboard/termsandconditions",
    "/dashboard/termsandconditions/new",
    "/dashboard/shippingpolicy",
    "/dashboard/shippingpolicy/new",
    "/dashboard/returnrefundpolicy",
    "/dashboard/returnrefundpolicy/new",
    "/dashboard/stitchingpolicy",
    "/dashboard/stitchingpolicy/new",
    "/shop-manager-dashboard",
     "/shop-manager-dashboard/profile",
    "/market-manager-dashboard",
    "/market-manager-dashboard/seo-meta",
     "/market-manager-dashboard/profile",
    "/dashboard/seo-meta",
  ]);

  // Dynamic route matchers
  const dynamicHidePatterns = [
    /^\/dashboard\/blogs\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/market-manager-dashboard\/blogs\/[^/]+$/,
    /^\/dashboard\/categories\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/shop-manager-dashboard\/categories\/[^/]+$/,

    /^\/dashboard\/navcategories\/[^/]+$/,
    /^\/dashboard\/header-categories\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/hero\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/newarrivals\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/trending\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/bestseller\/[^/]+$/,
    /^\/dashboard\/aboutus\/[^/]+$/,
    /^\/dashboard\/aboutus\/[^/]+$/,
    /^\/dashboard\/testimonials\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/shopbycategory\/[^/]+$/, // e.g., /dashboard/blogs/[id]

    /^\/dashboard\/products\/[^/]+$/, // e.g., /dashboard/products/[id]
    /^\/dashboard\/wholesalers\/[^/]+$/,
    /^\/dashboard\/invoices\/[^/]+$/,
    /^\/dashboard\/3pc-lehengas\/[^/]+$/,
    /^\/dashboard\/blouses\/[^/]+$/,
    /^\/dashboard\/one-pc-kurtis\/[^/]+$/,
    /^\/dashboard\/two-pc-kurtis\/[^/]+$/,
    /^\/dashboard\/three-pc-kurtis\/[^/]+$/,
    /^\/dashboard\/petticoat-kurtis\/[^/]+$/,

    /^\/dashboard\/banners\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/brand\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/topproduct\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/dashboard\/products\/[^/]+\/variations$/, // e.g., /dashboard/products/[id]/variations
    /^\/dashboard\/products\/[^/]+\/variations\/new$/, // e.g., /dashboard/products/[id]/variations/new
    /^\/dashboard\/newarrival\/detail\/[^/]+$/,

    /^\/dashboard\/coupons\/[^/]+$/,
    /^\/shop-manager-dashboard\/coupons\/[^/]+$/,

    /^\/dashboard\/category\/[^/]+$/, // e.g., /dashboard/blogs/[id]

    /^\/dashboard\/brands\/[^/]+$/, // e.g., /dashboard/blogs/[id]
    /^\/shop-manager-dashboard\/brands\/[^/]+$/,

    /^\/dashboard\/privacypolicy\/[^/]+$/,
    /^\/dashboard\/termsandconditions\/[^/]+$/,
    /^\/dashboard\/shippingpolicy\/[^/]+$/,
    /^\/dashboard\/returnrefundpolicy\/[^/]+$/,
    /^\/dashboard\/stitchingpolicy\/[^/]+$/,

    /^\/dashboard\/categories\/view\/[^/]+$/,
    /^\/dashboard\/wholesalers\/view\/[^/]+$/,
    /^\/dashboard\/invoices\/view\/[^/]+$/,

    /^\/shop-manager-dashboard\/categories\/view\/[^/]+$/,
    /^\/shop-manager-dashboard\/wholesalers\/view\/[^/]+$/,
    /^\/shop-manager-dashboard\/invoices\/view\/[^/]+$/,

    /^\/dashboard\/newarrivals\/view\/[^/]+$/,
    /^\/dashboard\/trending\/view\/[^/]+$/,
    /^\/dashboard\/shopbycategory\/view\/[^/]+$/,
    /^\/dashboard\/bestseller\/view\/[^/]+$/,

    /^\/dashboard\/products\/[^/]+\/3pc-lehengas\/new$/,
    /^\/dashboard\/products\/[^/]+\/blouses\/new$/,
    /^\/dashboard\/products\/[^/]+\/one-pc-kurtis\/new$/,
    /^\/dashboard\/products\/[^/]+\/two-pc-kurtis\/new$/,
    /^\/dashboard\/products\/[^/]+\/three-pc-kurtis\/new$/,
    /^\/dashboard\/products\/[^/]+\/petticoat-kurtis\/new$/,

    /^\/shop-manager-dashboard\/products\/[^/]+$/, // e.g., /dashboard/products/[id]
    /^\/shop-manager-dashboard\/wholesalers\/[^/]+$/,
    /^\/shop-manager-dashboard\/invoices\/[^/]+$/,
    /^\/shop-manager-dashboard\/3pc-lehengas\/[^/]+$/,
    /^\/shop-manager-dashboard\/blouses\/[^/]+$/,
    /^\/shop-manager-dashboard\/one-pc-kurtis\/[^/]+$/,
    /^\/shop-manager-dashboard\/two-pc-kurtis\/[^/]+$/,
    /^\/shop-manager-dashboard\/three-pc-kurtis\/[^/]+$/,
    /^\/shop-manager-dashboard\/petticoat-kurtis\/[^/]+$/,

    /^\/shop-manager-dashboard\/products\/[^/]+\/3pc-lehengas\/new$/,
    /^\/shop-manager-dashboard\/products\/[^/]+\/blouses\/new$/,
    /^\/shop-manager-dashboard\/products\/[^/]+\/one-pc-kurtis\/new$/,
    /^\/shop-manager-dashboard\/products\/[^/]+\/two-pc-kurtis\/new$/,
    /^\/shop-manager-dashboard\/products\/[^/]+\/three-pc-kurtis\/new$/,
    /^\/shop-manager-dashboard\/products\/[^/]+\/petticoat-kurtis\/new$/,
  ];

  const shouldHideLayout =
    staticHidePaths.has(pathname) ||
    dynamicHidePatterns.some((pattern) => pattern.test(pathname));

  // Ensure hydration is complete before rendering components that use context
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure to avoid layout shift
    return (
      <main>
        <div>{children}</div>
      </main>
    );
  }

  // Wrap everything in providers
  return (
    <WishlistProvider>
      <CartProvider>
        {!shouldHideLayout && (
          <>
            <Header />
            <ConditionalHero />
          </>
        )}
        <main>
          <AnimatedSection>{children}</AnimatedSection>
        </main>
        {!shouldHideLayout && (
          <AnimatedSection>
            <Footer />
          </AnimatedSection>
        )}
      </CartProvider>
    </WishlistProvider>
  );
}
