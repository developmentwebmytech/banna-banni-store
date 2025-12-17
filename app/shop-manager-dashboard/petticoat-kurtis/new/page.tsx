"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define options for dropdowns
const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const petticoatFabricOptions = ["Cotton", "Satin", "Silk", "Lycra", "Net", "Georgette"]
const waistSizeOptions = ["28", "30", "32", "34", "36", "Elastic", "Custom"]
const petticoatLengthOptions = ["36 inches", "38 inches", "40 inches", "Custom"]

interface Wholesaler {
  _id: string
  name: string
}

export default function NewPetticoatKurti() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentId = searchParams.get("parentId")
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])

  const [financialYear, setFinancialYear] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [petticoatFabricType, setPetticoatFabricType] = useState("")
  const [work, setWork] = useState("")
  const [waistSize, setWaistSize] = useState("")
  const [petticoatLength, setPetticoatLength] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [quantity, setQuantity] = useState<number>(0)

  useEffect(() => {
    const fetchWholesalers = async () => {
      try {
        const res = await fetch("/api/admin/wholesalers")
        const data = await res.json()
        setWholesalers(data)
      } catch (error) {
        console.error("Failed to fetch wholesalers:", error)
      }
    }
    fetchWholesalers()
  }, [])

  const handleCreate = async () => {
    const payload = {
      financialYear,
      wholesalerId,
      petticoatFabricType,
      work,
      waistSize,
      petticoatLength,
      manufacturer,
      quantity,
      ...(parentId && { parentProductId: parentId }),
    }

    await fetch("/api/admin/petticoat-kurtis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (parentId) {
      router.push(`/shop-manager-dashboard/products/${parentId}`)
    } else {
      router.push("/shop-manager-dashboard/petticoat-kurtis")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Petticoat Kurti Entry</CardTitle>
        <CardDescription>Fill in the details for the new Petticoat Kurti entry.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="financialYear">Financial Year</Label>
            <Select value={financialYear} onValueChange={setFinancialYear} required>
              <SelectTrigger id="financialYear">
                <SelectValue placeholder="Select Financial Year" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {financialYearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wholesaler">Wholesaler</Label>
            <Select value={wholesalerId} onValueChange={setWholesalerId} required>
              <SelectTrigger id="wholesaler">
                <SelectValue placeholder="Select Wholesaler" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {wholesalers.map((wholesaler) => (
                  <SelectItem key={wholesaler._id} value={wholesaler._id}>
                    {wholesaler.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="petticoatFabricType">Petticoat Fabric Type</Label>
            <Select value={petticoatFabricType} onValueChange={setPetticoatFabricType} required>
              <SelectTrigger id="petticoatFabricType">
                <SelectValue placeholder="Select Fabric Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {petticoatFabricOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="work">Work</Label>
            <Input
              id="work"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="Enter work details"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="waistSize">Waist Size</Label>
            <Select value={waistSize} onValueChange={setWaistSize} required>
              <SelectTrigger id="waistSize">
                <SelectValue placeholder="Select Waist Size" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {waistSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="petticoatLength">Petticoat Length</Label>
            <Select value={petticoatLength} onValueChange={setPetticoatLength} required>
              <SelectTrigger id="petticoatLength">
                <SelectValue placeholder="Select Petticoat Length" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {petticoatLengthOptions.map((length) => (
                  <SelectItem key={length} value={length}>
                    {length}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="Enter manufacturer"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Enter quantity"
              required
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="bg-teal-800 text-white" onClick={handleCreate}>
          Create Petticoat Kurti Entry
        </Button>
      </CardFooter>
    </Card>
  )
}
