import type { ReactNode } from "react"


interface DashboardLayoutProps {
  children: ReactNode
  activeItem: "profile" | "orders" | "cart"
}

export default function DashboardLayout({ children, activeItem }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
        
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-md shadow-sm">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
