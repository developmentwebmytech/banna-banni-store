"use client"

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10 rounded-full overflow-hidden">
            {user.image ? (
              <img
                src={user.image || "/placeholder.svg"}
                alt={user.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-semibold px-3 py-2 text-gray-900 dark:text-gray-100">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm">{user.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 border-gray-200 dark:border-gray-700" />

      
       

        <DropdownMenuSeparator className="my-1 border-gray-200 dark:border-gray-700" />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition-colors text-red-600 dark:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
