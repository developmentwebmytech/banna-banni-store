"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus } from "lucide-react"

interface Lehenga {
  _id: string
  financialYear: string
  wholesalerId: { _id: string; name: string } // Updated to reflect populated wholesaler
  designCode: string
  designName: string
  lehngaType: string
  quantity?: number // Quantity is no longer a required field in the model based on new fields
}

export default function ThreePcLehengaList() {
  const [lehengas, setLehengas] = useState<Lehenga[]>([])

  const fetchLehengas = () => {
    fetch("/api/admin/3pc-lehengas")
      .then((res) => res.json())
      .then(setLehengas)
  }

  useEffect(() => {
    fetchLehengas()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this 3pc Lehenga entry?")) {
      await fetch(`/api/admin/3pc-lehengas/${id}`, {
        method: "DELETE",
      })
      fetchLehengas() // Refresh the list after deletion
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">3pc Lehengas</CardTitle>
        <Link href="/dashboard/3pc-lehengas/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Lehenga
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Design Code</TableHead>
              <TableHead>Design Name</TableHead>
              <TableHead>Wholesaler</TableHead>
              <TableHead>Lehnga Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lehengas.map((l) => (
              <TableRow key={l._id}>
                <TableCell className="font-medium">{l.designCode}</TableCell>
                <TableCell>{l.designName}</TableCell>
                <TableCell>{l.wholesalerId?.name || "N/A"}</TableCell>
                <TableCell>{l.lehngaType}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/3pc-lehengas/${l._id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(l._id)}>
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
