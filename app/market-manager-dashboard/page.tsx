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
  title: "Dashboard | BannaBanni Store",
  description: "BannaBanni market manager dashboard overview",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex-1 py-4 md:p-8">
      <div className="flex items-center justify-between gap-8">
        <h2 className="text-4xl font-bold tracking-tight mb-6">Dashboard</h2>
      </div>

      {/* <div className="mb-4">
        <ClientSessionCheck />
      </div> */}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
     
      

        <Card className="bg-[#f0e7ff] hover:bg-[#e2d4fd] transition-colors duration-300 ease-in-out border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
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
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
              <path d="M20 22V2H8a2 2 0 0 0-2 2v15.5" />
              <path d="M16 6h2" />
              <path d="M16 10h2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newBlogs} new blogs this month
            </p>
          </CardContent>
        </Card>

      
      </div>
    </div>
  );
}
