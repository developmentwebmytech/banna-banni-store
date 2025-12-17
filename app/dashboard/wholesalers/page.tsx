"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus, Eye } from "lucide-react"

interface Wholesaler {
  _id: string
  name: string
  gstNumber?: string
  area?: string
  city?: string
  state?: string
  contactNumbers?: string[]
  email?: string
  website?: string
  address?: string
  pincode?: string
  productsPurchased?: string[]
}

export default function WholesalerList() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])

  const fetchWholesalers = () => {
    fetch("/api/admin/wholesalers")
      .then((res) => res.json())
      .then(setWholesalers)
  }

  useEffect(() => {
    fetchWholesalers()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this wholesaler?")) {
      await fetch(`/api/admin/wholesalers/${id}`, {
        method: "DELETE",
      })
      fetchWholesalers() // Refresh the list after deletion
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Wholesalers</CardTitle>
        <Link href="/dashboard/wholesalers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Wholesaler
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wholesalers.map((w) => (
              <TableRow key={w._id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>{w.city}</TableCell>
                <TableCell>{w.contactNumbers?.[0] || "N/A"}</TableCell>
                <TableCell>{w.productsPurchased?.join(", ") || "None"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/wholesalers/view/${w._id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    <Link href={`/dashboard/wholesalers/${w._id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(w._id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
