"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"

interface Address {
  _id: string
  address: string
  city: string
  state: string
  zipcode: string
  country: string
  countryCode: string
  mobileNumber: string
  isDefault: boolean
}

export default function AddressPage() {
  const { data: session, status } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Form state
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipcode, setZipcode] = useState("")
  const [country, setCountry] = useState("India")
  const [countryCode, setCountryCode] = useState("+91")
  const [mobileNumber, setMobileNumber] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    loadAddresses()
  }, [status, session])

  const loadAddresses = async () => {
    if (status === "authenticated" && session?.user?.email) {
      setAddressLoading(true)
      try {
        const res = await fetch("/api/user/addresses")
        if (res.ok) {
          const data = await res.json()
          setAddresses(data.addresses || [])
        } else {
          console.error("Address fetch failed:", await res.text())
        }
      } catch (error) {
        console.error("Failed to load addresses:", error)
      }
      setAddressLoading(false)
    }
  }

  const resetForm = () => {
    setAddress("")
    setCity("")
    setState("")
    setZipcode("")
    setCountry("India")
    setCountryCode("+91")
    setMobileNumber("")
    setIsDefault(false)
    setEditingAddress(null)
  }

  const handleAddAddress = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditAddress = (addressData: Address) => {
    setAddress(addressData.address)
    setCity(addressData.city)
    setState(addressData.state)
    setZipcode(addressData.zipcode)
    setCountry(addressData.country)
    setCountryCode(addressData.countryCode)
    setMobileNumber(addressData.mobileNumber)
    setIsDefault(addressData.isDefault)
    setEditingAddress(addressData)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = {
        address,
        city,
        state,
        zipcode,
        country,
        countryCode,
        mobileNumber,
        isDefault,
      }

      const url = editingAddress ? `/api/user/addresses/${editingAddress._id}` : "/api/user/addresses"
      const method = editingAddress ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error(data.error || "Address operation failed")
      } else {
        setIsDialogOpen(false)
        resetForm()
        loadAddresses()
      }
    } catch (error) {
      console.error("Address operation error:", error)
    }
    setLoading(false)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const res = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        loadAddresses()
      } else {
        const data = await res.json()
        console.error(data.error || "Failed to delete address")
      }
    } catch (error) {
      console.error("Delete address error:", error)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: "PUT",
      })

      if (res.ok) {
        loadAddresses()
      } else {
        const data = await res.json()
        console.error(data.error || "Failed to set default address")
      }
    } catch (error) {
      console.error("Set default address error:", error)
    }
  }

  if (status === "loading" || addressLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-600">You need to be signed in to view your addresses.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddAddress} className="flex items-center gap-2 cursor-pointer text-black">
              <Plus className="h-4 w-4 text-black" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-black">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 text-black">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter your full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipcode">ZIP Code</Label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    required
                    placeholder="ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                <div>
                  <Label htmlFor="countryCode">Country Code</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="+91">+91 (India)</SelectItem>
                      <SelectItem value="+1">+1 (US/Canada)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+61">+61 (Australia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    placeholder="Enter mobile number"
                    type="tel"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>

              <div className="flex gap-2 pt-4 text-black">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white text-black"></div>
                      {editingAddress ? "Updating..." : "Adding..."}
                    </div>
                  ) : editingAddress ? (
                    "Update Address"
                  ) : (
                    "Add Address"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
              <p className="text-gray-600 mb-4">Add your first address to get started</p>
              <Button onClick={handleAddAddress} className="flex items-center gap-2 cursor-pointer text-black">
                <Plus className="h-4 w-4 cursor-pointer text-black" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((addressData) => (
            <Card key={addressData._id} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Address</CardTitle>
                    {addressData.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAddress(addressData)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(addressData._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-gray-700">
                  <p className="font-medium">{addressData.address}</p>
                  <p>
                    {addressData.city}, {addressData.state} {addressData.zipcode}
                  </p>
                  <p>{addressData.country}</p>
                  <p className="text-sm text-gray-600">
                    Mobile: {addressData.countryCode} {addressData.mobileNumber}
                  </p>
                </div>
                {!addressData.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-transparent"
                    onClick={() => handleSetDefault(addressData._id)}
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
