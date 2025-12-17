"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

// Define options for dropdowns
const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const kurtiFabricOptions = ["Cotton", "Rayon", "Silk", "Georgette", "Linen", "Chiffon", "Crepe"]
const bustSizeOptions = ["32", "34", "36", "38", "40", "42", "44", "Custom"]
const kurtiLengthOptions = ["Short", "Knee-length", "Calf-length", "Ankle-length", "Custom"]
const sleeveLengthOptions = ["Short", "3/4th", "Full", "Sleeveless", "Custom"]

interface Wholesaler {
  _id: string
  name: string
}

export default function NewOnePcKurti() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const parentId = searchParams.get("parentId")
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [financialYear, setFinancialYear] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [kurtiFabricType, setKurtiFabricType] = useState("")
  const [work, setWork] = useState("")
  const [bustSize, setBustSize] = useState("")
  const [kurtiLength, setKurtiLength] = useState("")
  const [sleeveLength, setSleeveLength] = useState("")
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
        toast({
          title: "Error",
          description: "Failed to fetch wholesalers",
          variant: "destructive",
        })
      }
    }
    fetchWholesalers()
  }, [toast])

  const handleCreate = async () => {
    setIsLoading(true)

    try {
      const payload = {
        financialYear,
        wholesalerId,
        kurtiFabricType,
        work,
        bustSize,
        kurtiLength,
        sleeveLength,
        kurtiManufacturer,
        quantity,
        parentProductId: parentId, // Parent product ID add करते हैं
      }

      const response = await fetch("/api/admin/one-pc-kurtis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to create one-pc kurti")
      }

      toast({
        title: "Success",
        description: parentId ? "One-Pc Kurti added successfully to the product" : "One-Pc Kurti created successfully",
      })

      // Parent product के साथ जुड़ा है तो product edit page पर वापस जाएं
      if (parentId) {
        router.push(`/shop-manager-dashboard/products/${parentId}`)
      } else {
        router.push("/shop-manager-dashboard/one-pc-kurtis")
      }
    } catch (error) {
      console.error("Error creating one-pc kurti:", error)
      toast({
        title: "Error",
        description: "Failed to create one-pc kurti",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (parentId) {
      router.push(`/shop-manager-dashboard/products/${parentId}`)
    } else {
      router.push("/shop-manager-dashboard/one-pc-kurtis")
    }
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {parentId ? "Add One-Pc Kurti to Product" : "Add New One-Pc Kurti"}
        </h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>One-Pc Kurti Details</CardTitle>
          <CardDescription>Enter the details for the new one-pc kurti entry.</CardDescription>
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
        <CardFooter className="flex gap-4">
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="bg-teal-800 text-white" onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Add One-Pc Kurti"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
