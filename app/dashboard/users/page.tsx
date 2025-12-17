import type { Metadata } from "next"
import { getUsers } from "@/app/lib/data"
import { UsersTable } from "@/components/users/users-table"
import { UsersFilter } from "@/components/users/users-filter"

export const metadata: Metadata = {
  title: "Users | E-commerce Admin",
  description: "Manage your store users",
}

interface PageProps {
  searchParams: Promise<{ page?: string; per_page?: string; email?: string }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const per_page = Number(resolvedSearchParams.per_page) || 10
  const email = resolvedSearchParams.email || ""

  const { users, totalPages } = await getUsers({ page, per_page, email })

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-5xl font-bold tracking-tight">Users</h2>
      </div>

      <UsersFilter />

      <UsersTable users={users} totalPages={totalPages} page={page} per_page={per_page} />
    </div>
  )
}
