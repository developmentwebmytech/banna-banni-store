import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import type { Metadata } from "next";
import { getStats } from "@/app/lib/data";
import { ClientSessionCheck } from "@/components/client-session-check";

export const metadata: Metadata = {
  title: "ShopManagerDashboard | BannaBanni Store",
  description: "BannaBanni shop manager dashboard overview",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex-1 py-4 md:p-8">
      <div className="flex items-center justify-between gap-8">
        <h2 className="text-4xl font-bold tracking-tight mb-6">Shop Manager Dashboard</h2>
      </div>

      {/* <div className="mb-4">
        <ClientSessionCheck />
      </div> */}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
         <Card className="bg-[#cbfbf16e] hover:bg-[#cbfbf197] transition-colors duration-300 ease-in-out border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">Total Products</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+{stats.newProducts} new products this month</p>
          </CardContent>
        </Card>
        <Card className="bg-[#f0e7ff] hover:bg-[#e2d4fd] transition-colors duration-300 ease-in-out border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">+{stats.newCategories} new categories this month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#fff7cc] hover:bg-[#fff1aa] transition-colors duration-300 ease-in-out border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBrands}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newBrands} new brands this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
