"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Package, Save } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const lehngaTypeOptions = ["Bridal", "Party Wear", "Casual", "Designer"]
const stitchingOptions = ["Yes", "No", "Custom"]
const fabricOptions = ["Velvet", "Silk", "Cotton", "Georgette", "Net", "Satin"]

interface Wholesaler {
  _id: string
  name: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function New3pcLehengaForProduct({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [productId, setProductId] = useState<string>("")
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
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

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
    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        variant: "destructive",
      })
      return
    }

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
      }

      const response = await fetch(`/api/admin/products/${productId}/3pc-lehengas/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to create 3pc lehenga")
      }

      toast({
        title: "Success",
        description: "3pc Lehenga added successfully to the product",
      })

      router.push(`/dashboard/products/${productId}`)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/dashboard/products/${productId}`)}
            className="bg-white border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add 3-Piece Lehenga</h1>
              <p className="text-sm text-gray-600">Create a new 3-piece lehenga entry for this product</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-medium text-gray-900">3-Piece Lehenga Details</CardTitle>
            <CardDescription className="text-gray-600">
              Enter the details for the new 3-piece lehenga entry
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                    Financial Year
                  </Label>
                  <Select value={financialYear} onValueChange={setFinancialYear} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Financial Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {financialYearOptions.map((year) => (
                        <SelectItem key={year} value={year} className="hover:bg-gray-50">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholesaler" className="text-sm font-medium text-gray-700">
                    Wholesaler
                  </Label>
                  <Select value={wholesalerId} onValueChange={setWholesalerId} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Wholesaler" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {wholesalers.map((wholesaler) => (
                        <SelectItem key={wholesaler._id} value={wholesaler._id} className="hover:bg-gray-50">
                          {wholesaler.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Design Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Design Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="designCode" className="text-sm font-medium text-gray-700">
                    Design Code
                  </Label>
                  <Input
                    id="designCode"
                    value={designCode}
                    onChange={(e) => setDesignCode(e.target.value)}
                    placeholder="Enter design code"
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designName" className="text-sm font-medium text-gray-700">
                    Design Name
                  </Label>
                  <Input
                    id="designName"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Enter design name"
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lehngaType" className="text-sm font-medium text-gray-700">
                  Lehenga Type
                </Label>
                <Select value={lehngaType} onValueChange={setLehngaType} required>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Select Lehenga Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {lehngaTypeOptions.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-gray-50">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stitching Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Stitching Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blouseStitching" className="text-sm font-medium text-gray-700">
                    Blouse Stitching
                  </Label>
                  <Select value={blouseStitching} onValueChange={setBlouseStitching} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Stitching" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {stitchingOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-50">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skirtStitching" className="text-sm font-medium text-gray-700">
                    Skirt Stitching
                  </Label>
                  <Select value={skirtStitching} onValueChange={setSkirtStitching} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Stitching" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {stitchingOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-50">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Fabric Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Fabric Details</h3>
              <div className="space-y-2">
                <Label htmlFor="fabricType" className="text-sm font-medium text-gray-700">
                  General Fabric Type
                </Label>
                <Input
                  id="fabricType"
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  placeholder="Enter general fabric type"
                  className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blouseFabric" className="text-sm font-medium text-gray-700">
                    Blouse Fabric
                  </Label>
                  <Select value={blouseFabric} onValueChange={setBlouseFabric} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Fabric" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {fabricOptions.map((fabric) => (
                        <SelectItem key={fabric} value={fabric} className="hover:bg-gray-50">
                          {fabric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skirtFabric" className="text-sm font-medium text-gray-700">
                    Skirt Fabric
                  </Label>
                  <Select value={skirtFabric} onValueChange={setSkirtFabric} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Fabric" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {fabricOptions.map((fabric) => (
                        <SelectItem key={fabric} value={fabric} className="hover:bg-gray-50">
                          {fabric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dupattaFabric" className="text-sm font-medium text-gray-700">
                    Dupatta Fabric
                  </Label>
                  <Select value={dupattaFabric} onValueChange={setDupattaFabric} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Fabric" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {fabricOptions.map((fabric) => (
                        <SelectItem key={fabric} value={fabric} className="hover:bg-gray-50">
                          {fabric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workAndPrint" className="text-sm font-medium text-gray-700">
                  Work and Print
                </Label>
                <Input
                  id="workAndPrint"
                  value={workAndPrint}
                  onChange={(e) => setWorkAndPrint(e.target.value)}
                  placeholder="Enter work and print details"
                  className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Manufacturing Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Manufacturing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lehengaManufacturer" className="text-sm font-medium text-gray-700">
                    Lehenga Manufacturer
                  </Label>
                  <Input
                    id="lehengaManufacturer"
                    value={lehengaManufacturer}
                    onChange={(e) => setLehengaManufacturer(e.target.value)}
                    placeholder="Enter manufacturer name"
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Enter quantity"
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="hasKenken"
                  checked={hasKenken}
                  onCheckedChange={(checked) => setHasKenken(checked as boolean)}
                  className="border-gray-300"
                />
                <Label htmlFor="hasKenken" className="text-sm font-medium text-gray-700">
                  Has Kenken
                </Label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex gap-3 ml-auto">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/products/${productId}`)}
                disabled={isLoading}
                className="bg-white border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isLoading}
                className="bg-teal-700 hover:bg-teal-700 text-white px-6"
              >
                {isLoading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add 3pc Lehenga
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
