import UserAccountSidebar from "@/components/user-account-sidebar-aQpsq3bD207mZv7kDABs9okoFJaCq8"
import AddressPage from "@/components/address-page"

export default function AccountAddressPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <UserAccountSidebar activeItem="address" />
          </div>
          <div className="lg:w-3/4">
            <div className="bg-white rounded-md shadow-sm">
              <AddressPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
