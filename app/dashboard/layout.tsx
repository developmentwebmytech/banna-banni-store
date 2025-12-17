import type React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { UserNav } from "@/components/user-nav";
import { ResizableSidebar } from "@/components/resizable-sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-gray-400 bg-gray-50">
          <div className="relative flex h-16 items-center justify-between px-4">
            {/* Left: Admin Dashboard */}
            <div className="flex items-center gap-2">
              <MobileSidebar />
              <Link href="/dashboard">
                <span className="hidden font-bold sm:inline-block text-xl">
                  Admin Dashboard
                </span>
              </Link>
            </div>

            {/* Center: Logo (absolutely centered) */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/dashboard" className="inline-block">
                <img src="/logo-removebg-preview.png" alt="Logo" className="w-40" />
              </Link>
            </div>

            {/* Right: User controls */}
            <div className="flex items-center gap-2">
              <UserNav user={session.user} />
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Sticky Sidebar */}
          <div className="sticky top-16 h-[calc(100vh-4rem)] z-30">
            <ResizableSidebar />
          </div>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
