"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Mail, Phone, Globe, MapPin } from "lucide-react"
import Link from "next/link"

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
  createdAt: string
  updatedAt: string
}

export default function ViewWholesaler() {
  const params = useParams()
  const router = useRouter()
  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/admin/wholesalers/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setWholesaler(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching wholesaler:", error)
          setLoading(false)
        })
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!wholesaler) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">Wholesaler not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{wholesaler.name}</h1>
            <p className="text-muted-foreground">Wholesaler Details</p>
          </div>
        </div>
        <Link href={`/shop-manager-dashboard/wholesalers/${wholesaler._id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Wholesaler
          </Button>
        </Link>
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wholesaler Name</label>
                <p className="text-lg font-semibold">{wholesaler.name}</p>
              </div>

              {wholesaler.gstNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GST Number</label>
                  <p className="font-mono">{wholesaler.gstNumber}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{[wholesaler.area, wholesaler.city, wholesaler.state].filter(Boolean).join(", ")}</span>
                </div>
              </div>

              {wholesaler.pincode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
                  <p>{wholesaler.pincode}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {wholesaler.contactNumbers && wholesaler.contactNumbers.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Numbers</label>
                  <div className="space-y-2 mt-1">
                    {wholesaler.contactNumbers.map((contact, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{contact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wholesaler.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${wholesaler.email}`} className="text-blue-600 hover:underline">
                      {wholesaler.email}
                    </a>
                  </div>
                </div>
              )}

              {wholesaler.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={
                        wholesaler.website.startsWith("http") ? wholesaler.website : `https://${wholesaler.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {wholesaler.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {wholesaler.address && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="mt-1 p-3 bg-muted rounded-md">{wholesaler.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card>
        <CardHeader>
          <CardTitle>Products Purchased</CardTitle>
        </CardHeader>
        <CardContent>
          {wholesaler.productsPurchased && wholesaler.productsPurchased.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {wholesaler.productsPurchased.map((product, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {product}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No products selected</p>
          )}
        </CardContent>
      </Card>

      {/* Timestamps Card */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p>{new Date(wholesaler.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p>{new Date(wholesaler.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
