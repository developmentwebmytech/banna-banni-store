"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus } from "lucide-react"

interface Blouse {
  _id: string
  financialYear: string
  wholesalerId: { _id: string; name: string } // Updated to reflect populated wholesaler
  fabricType: string
  bustSize: string
  blouseManufacturer: string
  quantity: number
}

export default function BlouseList() {
  const [blouses, setBlouses] = useState<Blouse[]>([])

  const fetchBlouses = () => {
    fetch("/api/admin/blouses")
      .then((res) => res.json())
      .then(setBlouses)
  }

  useEffect(() => {
    fetchBlouses()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blouse entry?")) {
      await fetch(`/api/admin/blouses/${id}`, {
        method: "DELETE",
      })
      fetchBlouses() // Refresh the list after deletion
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Blouse Entries</CardTitle>
        <Link href="/dashboard/blouses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Blouse
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Financial Year</TableHead>
              <TableHead>Wholesaler</TableHead>
              <TableHead>Fabric Type</TableHead>
              <TableHead>Bust Size</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blouses.map((b) => (
              <TableRow key={b._id}>
                <TableCell className="font-medium">{b.financialYear}</TableCell>
                <TableCell>{b.wholesalerId?.name || "N/A"}</TableCell>
                <TableCell>{b.fabricType}</TableCell>
                <TableCell>{b.bustSize}</TableCell>
                <TableCell>{b.quantity}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/blouses/${b._id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(b._id)}>
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
