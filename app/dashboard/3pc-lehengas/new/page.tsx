"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const lehngaTypeOptions = ["Bridal", "Party Wear", "Casual", "Designer"]
const stitchingOptions = ["Yes", "No", "Custom"]
const fabricOptions = ["Velvet", "Silk", "Cotton", "Georgette", "Net", "Satin"]

interface Wholesaler {
  _id: string
  name: string
}

export default function New3pcLehenga() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const parentId = searchParams.get("parentId")
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [financialYear, setFinancialYear] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [designCode, setDesignCode] = useState("")
  const [designName, setDesignName] = useState("")
  const [lehngaType, setLehngaType] = useState("")
  const [blouseStitching, setBlouseStitching] = useState("")
  const [skirtStitching, setSkirtStitching] = useState("")
  const [fabricType, setFabricType] = useState("")
  const [blouseFabric, setBlouseFabric] = useState("")
  const [skirtFabric, setSkirtFabric] = useState("")
  const [dupattaFabric, setDupattaFabric] = useState("")
  const [workAndPrint, setWorkAndPrint] = useState("")
  const [lehengaManufacturer, setLehengaManufacturer] = useState("")
  const [hasKenken, setHasKenken] = useState(false)
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
        designCode,
        designName,
        lehngaType,
        blouseStitching,
        skirtStitching,
        fabricType,
        blouseFabric,
        skirtFabric,
        dupattaFabric,
        workAndPrint,
        lehengaManufacturer,
        hasKenken,
        quantity,
        parentProductId: parentId, // Parent product ID add करते हैं
      }

      const response = await fetch("/api/admin/3pc-lehengas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to create 3pc lehenga")
      }

      toast({
        title: "Success",
        description: parentId ? "3pc Lehenga added successfully to the product" : "3pc Lehenga created successfully",
      })

      // Parent product के साथ जुड़ा है तो product edit page पर वापस जाएं
      if (parentId) {
        router.push(`/dashboard/products/${parentId}`)
      } else {
        router.push("/dashboard/3pc-lehengas")
      }
    } catch (error) {
      console.error("Error creating 3pc lehenga:", error)
      toast({
        title: "Error",
        description: "Failed to create 3pc lehenga",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (parentId) {
      router.push(`/dashboard/products/${parentId}`)
    } else {
      router.push("/dashboard/3pc-lehengas")
    }
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {parentId ? "Add 3pc Lehenga to Product" : "Add New 3pc Lehenga"}
        </h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>3pc Lehenga Details</CardTitle>
          <CardDescription>Enter the details for the new 3pc Lehenga entry.</CardDescription>
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
              <Label htmlFor="designCode">Design Code</Label>
              <Input
                id="designCode"
                value={designCode}
                onChange={(e) => setDesignCode(e.target.value)}
                placeholder="Enter design code"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="designName">Design Name</Label>
              <Input
                id="designName"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Enter design name"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lehngaType">Lehenga Type</Label>
            <Select value={lehngaType} onValueChange={setLehngaType} required>
              <SelectTrigger id="lehngaType">
                <SelectValue placeholder="Select Lehenga Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lehngaTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="blouseStitching">Blouse Stitching</Label>
              <Select value={blouseStitching} onValueChange={setBlouseStitching} required>
                <SelectTrigger id="blouseStitching">
                  <SelectValue placeholder="Select Stitching" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {stitchingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skirtStitching">Skirt Stitching</Label>
              <Select value={skirtStitching} onValueChange={setSkirtStitching} required>
                <SelectTrigger id="skirtStitching">
                  <SelectValue placeholder="Select Stitching" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {stitchingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fabricType">Fabric Type</Label>
            <Input
              id="fabricType"
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              placeholder="Enter general fabric type"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="blouseFabric">Blouse Fabric</Label>
              <Select value={blouseFabric} onValueChange={setBlouseFabric} required>
                <SelectTrigger id="blouseFabric">
                  <SelectValue placeholder="Select Fabric" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {fabricOptions.map((fabric) => (
                    <SelectItem key={fabric} value={fabric}>
                      {fabric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skirtFabric">Skirt Fabric</Label>
              <Select value={skirtFabric} onValueChange={setSkirtFabric} required>
                <SelectTrigger id="skirtFabric">
                  <SelectValue placeholder="Select Fabric" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {fabricOptions.map((fabric) => (
                    <SelectItem key={fabric} value={fabric}>
                      {fabric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dupattaFabric">Dupatta Fabric</Label>
              <Select value={dupattaFabric} onValueChange={setDupattaFabric} required>
                <SelectTrigger id="dupattaFabric">
                  <SelectValue placeholder="Select Fabric" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {fabricOptions.map((fabric) => (
                    <SelectItem key={fabric} value={fabric}>
                      {fabric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          <div className="grid gap-2">
            <Label htmlFor="lehengaManufacturer">Lehenga Manufacturer</Label>
            <Input
              id="lehengaManufacturer"
              value={lehengaManufacturer}
              onChange={(e) => setLehengaManufacturer(e.target.value)}
              placeholder="Enter lehenga manufacturer"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasKenken"
              checked={hasKenken}
              onCheckedChange={(checked) => setHasKenken(checked as boolean)}
            />
            <Label htmlFor="hasKenken">Has Kenken</Label>
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
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="bg-teal-800 text-white" onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Add 3pc Lehenga"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
