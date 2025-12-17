"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus } from "lucide-react"

interface Kurti {
  _id: string
  financialYear: string
  wholesalerId: { _id: string; name: string } // Updated to reflect populated wholesaler
  kurtiFabricType: string
  pattern: string
  bustSize: string
  kurtiManufacturer: string
  quantity: number
}

export default function ThreePcKurtiList() {
  const [kurtis, setKurtis] = useState<Kurti[]>([])

  const fetchKurtis = () => {
    fetch("/api/admin/three-pc-kurtis")
      .then((res) => res.json())
      .then(setKurtis)
  }

  useEffect(() => {
    fetchKurtis()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this 3pc Kurti entry?")) {
      await fetch(`/api/admin/three-pc-kurtis/${id}`, {
        method: "DELETE",
      })
      fetchKurtis() // Refresh the list after deletion
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">3pc Kurti Entries</CardTitle>
        <Link href="/shop-manager-dashboard/three-pc-kurtis/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New 3pc Kurti
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
              <TableHead>Pattern</TableHead>
              <TableHead>Bust Size</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kurtis.map((k) => (
              <TableRow key={k._id}>
                <TableCell className="font-medium">{k.financialYear}</TableCell>
                <TableCell>{k.wholesalerId?.name || "N/A"}</TableCell>
                <TableCell>{k.kurtiFabricType}</TableCell>
                <TableCell>{k.pattern}</TableCell>
                <TableCell>{k.bustSize}</TableCell>
                <TableCell>{k.quantity}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/shop-manager-dashboard/three-pc-kurtis/${k._id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(k._id)}>
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
