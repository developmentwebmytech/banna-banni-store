"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/app/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  House,
  CalendarArrowDown,
  BookOpenCheck,
  TableOfContents,
  PanelTop,
  ChevronDown,
  ChevronRight,
  BadgeDollarSign,
  UserCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Wholeseller",
    href: "/dashboard/wholesalers",
    icon: Package,
  },
 {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: Package,
  },
  {
    title: "Brands",
    href: "/dashboard/brands",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Package,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Homepage Sections",
    icon: House,
    children: [
      
      { title: "Testimonials", href: "/dashboard/testimonials" },
     
      { title: "About Us", href: "/dashboard/aboutus" },
      { title: "Hero Section", href: "/dashboard/hero" },
     
      { title: "Privacy Policy", href: "/dashboard/privacypolicy" },
      { title: "Terms and Conditions", href: "/dashboard/termsandconditions" },
      { title: "Shipping Policy", href: "/dashboard/shippingpolicy" },
     
      {
        title: "Return & Refund Policy",
        href: "/dashboard/returnrefundpolicy",
      },
      { title: "Stitching Policy", href: "/dashboard/stitchingpolicy" },
      { title: "Seo Meta", href: "/dashboard/seo-meta" },
    ],
  },
  
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: CalendarArrowDown,
  },
    {
    title: "Settings",
    href: "/dashboard/settings/contact-address",
    icon: CalendarArrowDown,
  },
  {
    title: "Blogs",
    href: "/dashboard/blogs",
    icon: BookOpenCheck,
  },
  {
    title: "Coupons",
    href: "/dashboard/coupons",
    icon: BadgeDollarSign,
  },
  {
    title: "Faqs",
    href: "/dashboard/faqs",
    icon: TableOfContents,
  },

  {
    title: "Contact Us",
    href: "/dashboard/contact",
    icon: PanelTop,
  },
  
];

interface DashboardNavProps {
  setOpen?: (open: boolean) => void;
}

export function DashboardNav({ setOpen }: DashboardNavProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <nav className="h-full py-4 overflow-y-scroll scrollbar-none bg-white">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={item.title} className="flex flex-col">
              <div>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors",
                      pathname === item.href
                        ? "bg-teal-600 text-white"
                        : "transparent"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.title)}
                    className="group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-blue-100 transition-colors w-full"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {openMenus[item.title] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                {item.children && openMenus[item.title] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => {
                          if (setOpen) setOpen(false);
                        }}
                        className={cn(
                          "block rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-teal-100 hover:text-teal-800 transition-colors",
                          pathname === child.href
                            ? "bg-blue-200 text-teal-900 font-medium"
                            : ""
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {index < items.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
