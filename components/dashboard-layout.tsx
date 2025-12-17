import type { ReactNode } from "react"
import UserAccountSidebar from "../components/user-account-sidebar-aQpsq3bD207mZv7kDABs9okoFJaCq8"

interface DashboardLayoutProps {
  children: ReactNode
  activeItem: "profile" | "orders" | "cart"
}

export default function DashboardLayout({ children, activeItem }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <UserAccountSidebar activeItem={activeItem} />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-md shadow-sm">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
