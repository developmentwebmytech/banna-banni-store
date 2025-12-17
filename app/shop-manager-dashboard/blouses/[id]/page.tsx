"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define options for dropdowns
const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const fabricOptions = ["Velvet", "Silk", "Cotton", "Georgette", "Net", "Satin", "Brocade", "Chiffon"]
const bustSizeOptions = ["32", "34", "36", "38", "40", "Custom"]
const blouseLengthOptions = ["13 inches", "14 inches", "15 inches", "16 inches", "Custom"]
const sleeveLengthOptions = ["Short", "Elbow", "Full", "Sleeveless", "Custom"]

interface Wholesaler {
  _id: string
  name: string
}

export default function EditBlouse() {
  const params = useParams()
  const router = useRouter()
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])

  const [financialYear, setFinancialYear] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [fabricType, setFabricType] = useState("")
  const [workAndPrint, setWorkAndPrint] = useState("")
  const [bustSize, setBustSize] = useState("")
  const [blouseLength, setBlouseLength] = useState("")
  const [sleeveLength, setSleeveLength] = useState("")
  const [blouseManufacturer, setBlouseManufacturer] = useState("")
  const [quantity, setQuantity] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wholesalers
        const wholesalersRes = await fetch("/api/admin/wholesalers")
        const wholesalersData = await wholesalersRes.json()
        setWholesalers(wholesalersData)

        // Fetch blouse data
        const id = await params.id
        if (id) {
          const blouseRes = await fetch(`/api/admin/blouses/${id}`)
          const data = await blouseRes.json()

          setFinancialYear(data.financialYear || "")
          setWholesalerId(data.wholesalerId?._id || "")
          setFabricType(data.fabricType || "")
          setWorkAndPrint(data.workAndPrint || "")
          setBustSize(data.bustSize || "")
          setBlouseLength(data.blouseLength || "")
          setSleeveLength(data.sleeveLength || "")
          setBlouseManufacturer(data.blouseManufacturer || "")
          setQuantity(data.quantity || 0)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    fetchData()
  }, [params])

  const handleUpdate = async () => {
    const id = await params.id
    const payload = {
      financialYear,
      wholesalerId,
      fabricType,
      workAndPrint,
      bustSize,
      blouseLength,
      sleeveLength,
      blouseManufacturer,
      quantity,
    }

    await fetch(`/api/admin/blouses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    router.push("/shop-manager-dashboard/blouses")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Blouse Entry</CardTitle>
        <CardDescription>Update the details for this blouse entry.</CardDescription>
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
            <Label htmlFor="fabricType">Fabric Type</Label>
            <Select value={fabricType} onValueChange={setFabricType} required>
              <SelectTrigger id="fabricType">
                <SelectValue placeholder="Select Fabric Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {fabricOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workAndPrint">Work and Print</Label>
            <Input
              id="workAndPrint"
              value={workAndPrint}
              onChange={(e) => setWorkAndPrint(e.target.value)}
              placeholder="Enter work and print details"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bustSize">Bust Size</Label>
            <Select value={bustSize} onValueChange={setBustSize} required>
              <SelectTrigger id="bustSize">
                <SelectValue placeholder="Select Bust Size" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {bustSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blouseLength">Blouse Length</Label>
            <Select value={blouseLength} onValueChange={setBlouseLength} required>
              <SelectTrigger id="blouseLength">
                <SelectValue placeholder="Select Blouse Length" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {blouseLengthOptions.map((length) => (
                  <SelectItem key={length} value={length}>
                    {length}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sleeveLength">Sleeve Length</Label>
            <Select value={sleeveLength} onValueChange={setSleeveLength} required>
              <SelectTrigger id="sleeveLength">
                <SelectValue placeholder="Select Sleeve Length" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {sleeveLengthOptions.map((length) => (
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
            <Label htmlFor="blouseManufacturer">Blouse Manufacturer</Label>
            <Input
              id="blouseManufacturer"
              value={blouseManufacturer}
              onChange={(e) => setBlouseManufacturer(e.target.value)}
              placeholder="Enter blouse manufacturer"
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
        <Button className="bg-teal-800 text-white" onClick={handleUpdate}>
          Update Blouse Entry
        </Button>
      </CardFooter>
    </Card>
  )
}
