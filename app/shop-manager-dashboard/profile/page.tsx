import DashboardLayout from "@/components/shopmanager/dashboard-layout"
import ProfilePage from "@/components/profile-page"

export default function Profile() {
  return (
    <DashboardLayout activeItem="profile">
      <ProfilePage />
    </DashboardLayout>
  )
}
