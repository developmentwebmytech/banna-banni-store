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
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const items = [
  {
    title: "Dashboard",
    href: "/shop-manager-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/shop-manager-dashboard/profile",
    icon: Users,
  },
  {
    title: "Products",
    href: "/shop-manager-dashboard/products",
    icon: Package,
  },
  {
    title: "Wholeseller",
    href: "/shop-manager-dashboard/wholesalers",
    icon: Package,
  },
 {
    title: "Invoices",
    href: "/shop-manager-dashboard/invoices",
    icon: Package,
  },
  {
    title: "Brands",
    href: "/shop-manager-dashboard/brands",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/shop-manager-dashboard/categories",
    icon: Package,
  },
  
  
  {
    title: "Orders",
    href: "/shop-manager-dashboard/orders",
    icon: CalendarArrowDown,
  },
  
  {
    title: "Coupons",
    href: "/shop-manager-dashboard/coupons",
    icon: BadgeDollarSign,
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

           
              </div>
              {index < items.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
