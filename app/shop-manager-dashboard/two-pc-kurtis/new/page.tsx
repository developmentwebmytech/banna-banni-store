"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Define options for dropdowns
const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const kurtiFabricOptions = ["Cotton", "Rayon", "Silk", "Georgette", "Linen", "Chiffon", "Crepe"]
const patternOptions = ["Solid", "Printed", "Embroidered", "Striped", "Floral", "Geometric"]
const bustSizeOptions = ["32", "34", "36", "38", "40", "42", "44", "Custom"]
const kurtiLengthOptions = ["Short", "Knee-length", "Calf-length", "Ankle-length", "Custom"]
const sleeveLengthOptions = ["Short", "3/4th", "Full", "Sleeveless", "Custom"]
const pantLengthOptions = ["36 inches", "38 inches", "40 inches", "Custom"]
const pantWaistSizeOptions = ["28", "30", "32", "34", "36", "Elastic", "Custom"]
const pantHipSizeOptions = ["36", "38", "40", "42", "44", "Custom"]

interface Wholesaler {
  _id: string
  name: string
}

export default function NewTwoPcKurti() {
  const router = useRouter()
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])

  const [financialYear, setFinancialYear] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [kurtiFabricType, setKurtiFabricType] = useState("")
  const [pattern, setPattern] = useState("")
  const [work, setWork] = useState("")
  const [bustSize, setBustSize] = useState("")
  const [kurtiLength, setKurtiLength] = useState("")
  const [sleeveLength, setSleeveLength] = useState("")
  const [pantLength, setPantLength] = useState("")
  const [pantWaistSize, setPantWaistSize] = useState("")
  const [pantHipSize, setPantHipSize] = useState("")
  const [stretchable, setStretchable] = useState(false)
  const [kurtiManufacturer, setKurtiManufacturer] = useState("")
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
      kurtiFabricType,
      pattern,
      work,
      bustSize,
      kurtiLength,
      sleeveLength,
      pantLength,
      pantWaistSize,
      pantHipSize,
      stretchable,
      kurtiManufacturer,
      quantity,
    }

    await fetch("/api/admin/two-pc-kurtis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    router.push("/shop-manager-dashboard/two-pc-kurtis")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New 2pc Kurti Entry</CardTitle>
        <CardDescription>Fill in the details for the new 2pc Kurti entry.</CardDescription>
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
            <Label htmlFor="kurtiFabricType">Kurti Fabric Type</Label>
            <Select value={kurtiFabricType} onValueChange={setKurtiFabricType} required>
              <SelectTrigger id="kurtiFabricType">
                <SelectValue placeholder="Select Fabric Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {kurtiFabricOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pattern">Pattern</Label>
            <Select value={pattern} onValueChange={setPattern} required>
              <SelectTrigger id="pattern">
                <SelectValue placeholder="Select Pattern" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {patternOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <Label htmlFor="kurtiLength">Kurti Length</Label>
            <Select value={kurtiLength} onValueChange={setKurtiLength} required>
              <SelectTrigger id="kurtiLength">
                <SelectValue placeholder="Select Kurti Length" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {kurtiLengthOptions.map((length) => (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pantLength">Pant Length</Label>
            <Select value={pantLength} onValueChange={setPantLength} required>
              <SelectTrigger id="pantLength">
                <SelectValue placeholder="Select Pant Length" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {pantLengthOptions.map((length) => (
                  <SelectItem key={length} value={length}>
                    {length}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pantWaistSize">Pant Waist Size</Label>
            <Select value={pantWaistSize} onValueChange={setPantWaistSize} required>
              <SelectTrigger id="pantWaistSize">
                <SelectValue placeholder="Select Pant Waist Size" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {pantWaistSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pantHipSize">Pant Hip Size</Label>
            <Select value={pantHipSize} onValueChange={setPantHipSize} required>
              <SelectTrigger id="pantHipSize">
                <SelectValue placeholder="Select Pant Hip Size" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {pantHipSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="stretchable"
            checked={stretchable}
            onCheckedChange={(checked) => setStretchable(checked as boolean)}
          />
          <Label htmlFor="stretchable">Stretchable</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="kurtiManufacturer">Kurti Manufacturer</Label>
            <Input
              id="kurtiManufacturer"
              value={kurtiManufacturer}
              onChange={(e) => setKurtiManufacturer(e.target.value)}
              placeholder="Enter kurti manufacturer"
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
          Create Kurti Entry
        </Button>
      </CardFooter>
    </Card>
  )
}
