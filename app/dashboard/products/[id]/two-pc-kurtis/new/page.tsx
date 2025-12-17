"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Package, Save } from "lucide-react"

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

interface Product {
  _id: string
  name: string
}

export default function NewProductTwoPcKurti() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
    const fetchData = async () => {
      try {
        // Fetch product details
        const productRes = await fetch(`/api/admin/products/${productId}`)
        if (productRes.ok) {
          const productData = await productRes.json()
          setProduct(productData)
        }

        // Fetch wholesalers
        const wholesalersRes = await fetch("/api/admin/wholesalers")
        if (wholesalersRes.ok) {
          const wholesalersData = await wholesalersRes.json()
          setWholesalers(wholesalersData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    if (productId) {
      fetchData()
    }
  }, [productId])

  const handleCreate = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
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

      const response = await fetch(`/api/admin/products/${productId}/two-pc-kurtis/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push(`/dashboard/products/${productId}`)
      } else {
        throw new Error("Failed to create two-pc kurti")
      }
    } catch (error) {
      console.error("Error creating two-pc kurti:", error)
      alert("Failed to create two-pc kurti. Please try again.")
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add 2-Piece Kurti</h1>
              <p className="text-sm text-gray-600">Create a new 2-piece kurti entry for {product?.name}</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-medium text-gray-900">2-Piece Kurti Details</CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details for the new 2-piece kurti entry
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

            {/* Fabric & Design */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Fabric & Design</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kurtiFabricType" className="text-sm font-medium text-gray-700">
                    Kurti Fabric Type
                  </Label>
                  <Select value={kurtiFabricType} onValueChange={setKurtiFabricType} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Fabric Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {kurtiFabricOptions.map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-gray-50">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pattern" className="text-sm font-medium text-gray-700">
                    Pattern
                  </Label>
                  <Select value={pattern} onValueChange={setPattern} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {patternOptions.map((p) => (
                        <SelectItem key={p} value={p} className="hover:bg-gray-50">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work" className="text-sm font-medium text-gray-700">
                  Work Details
                </Label>
                <Input
                  id="work"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="Enter work details"
                  className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Kurti Measurements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Kurti Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bustSize" className="text-sm font-medium text-gray-700">
                    Bust Size
                  </Label>
                  <Select value={bustSize} onValueChange={setBustSize} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {bustSizeOptions.map((size) => (
                        <SelectItem key={size} value={size} className="hover:bg-gray-50">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kurtiLength" className="text-sm font-medium text-gray-700">
                    Kurti Length
                  </Label>
                  <Select value={kurtiLength} onValueChange={setKurtiLength} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Length" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {kurtiLengthOptions.map((length) => (
                        <SelectItem key={length} value={length} className="hover:bg-gray-50">
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleeveLength" className="text-sm font-medium text-gray-700">
                    Sleeve Length
                  </Label>
                  <Select value={sleeveLength} onValueChange={setSleeveLength} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Length" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {sleeveLengthOptions.map((length) => (
                        <SelectItem key={length} value={length} className="hover:bg-gray-50">
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pant Measurements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Pant Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pantLength" className="text-sm font-medium text-gray-700">
                    Pant Length
                  </Label>
                  <Select value={pantLength} onValueChange={setPantLength} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Length" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {pantLengthOptions.map((length) => (
                        <SelectItem key={length} value={length} className="hover:bg-gray-50">
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pantWaistSize" className="text-sm font-medium text-gray-700">
                    Pant Waist Size
                  </Label>
                  <Select value={pantWaistSize} onValueChange={setPantWaistSize} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {pantWaistSizeOptions.map((size) => (
                        <SelectItem key={size} value={size} className="hover:bg-gray-50">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pantHipSize" className="text-sm font-medium text-gray-700">
                    Pant Hip Size
                  </Label>
                  <Select value={pantHipSize} onValueChange={setPantHipSize} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {pantHipSizeOptions.map((size) => (
                        <SelectItem key={size} value={size} className="hover:bg-gray-50">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="stretchable"
                  checked={stretchable}
                  onCheckedChange={(checked) => setStretchable(checked as boolean)}
                  className="border-gray-300"
                />
                <Label htmlFor="stretchable" className="text-sm font-medium text-gray-700">
                  Stretchable fabric
                </Label>
              </div>
            </div>

            {/* Manufacturing Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Manufacturing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kurtiManufacturer" className="text-sm font-medium text-gray-700">
                    Kurti Manufacturer
                  </Label>
                  <Input
                    id="kurtiManufacturer"
                    value={kurtiManufacturer}
                    onChange={(e) => setKurtiManufacturer(e.target.value)}
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
                    Create Kurti Entry
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
