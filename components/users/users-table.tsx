"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/app/hooks/use-toast"
import { Trash2, Edit } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { ResponsiveTable } from "@/components/responsive-table"
import { EditUserModal } from "@/components/users/edit-user-modal"

interface UsersTableProps {
  users: any[]
  totalPages: number
  page: number
  per_page: number
}

export function UsersTable({ users, totalPages, page, per_page }: UsersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEditClick = (id: string) => {
    setEditingUserId(id)
    setEditModalOpen(true)
  }

  const renderDesktopRow = (user: any) => (
    <>
      <TableCell>
        <div>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </TableCell>
      <TableCell className="capitalize">
        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-muted">{user.role}</span>
      </TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => handleEditClick(user._id.toString())}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white bg-gray-500 hover:bg-red-600 hover:text-white">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the user. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(user._id.toString())}
                  disabled={isDeleting === user._id.toString()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting === user._id.toString() ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </>
  )

  const renderMobileRow = (user: any, isExpanded: boolean) => (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )

  const renderExpandedContent = (user: any) => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1">
        <p className="text-sm font-medium">Role:</p>
        <p className="text-sm capitalize">{user.role}</p>
        <p className="text-sm font-medium">Created At:</p>
        <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button size="sm" variant="outline" onClick={() => handleEditClick(user._id.toString())}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the user. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(user._id.toString())}
                disabled={isDeleting === user._id.toString()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting === user._id.toString() ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Desktop view */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => <TableRow key={user._id.toString()}>{renderDesktopRow(user)}</TableRow>)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <ResponsiveTable
          headers={["User", "Role", "Created At", "Actions"]}
          data={users}
          renderRow={renderMobileRow}
          renderExpandedContent={renderExpandedContent}
          keyField="_id"
          className={users.length === 0 ? "hidden" : ""}
        />

        {users.length === 0 && (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} currentPage={page} />

      {editingUserId && <EditUserModal userId={editingUserId} open={editModalOpen} onOpenChange={setEditModalOpen} />}
    </div>
  )
}
