"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Save } from "lucide-react"

// Define options for dropdowns
const financialYearOptions = ["2023-2024", "2024-2025", "2025-2026"]
const petticoatFabricOptions = ["Cotton", "Satin", "Silk", "Lycra", "Net", "Georgette"]
const waistSizeOptions = ["28", "30", "32", "34", "36", "Elastic", "Custom"]
const petticoatLengthOptions = ["36 inches", "38 inches", "40 inches", "Custom"]

interface Wholesaler {
  _id: string
  name: string
}

interface Product {
  _id: string
  name: string
}

export default function NewProductPetticoatKurti() {
  const { id } = useParams()
  const router = useRouter()
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [financialYear, setFinancialYear] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [petticoatFabricType, setPetticoatFabricType] = useState("")
  const [work, setWork] = useState("")
  const [waistSize, setWaistSize] = useState("")
  const [petticoatLength, setPetticoatLength] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [quantity, setQuantity] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wholesalers
        const wholesalersRes = await fetch("/api/admin/wholesalers")
        const wholesalersData = await wholesalersRes.json()
        setWholesalers(wholesalersData)

        // Fetch product details
        const productRes = await fetch(`/api/admin/products/${id}`)
        const productData = await productRes.json()
        setProduct(productData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [id])

  const handleCreate = async () => {
    setIsLoading(true)
    const payload = {
      financialYear,
      wholesalerId,
      petticoatFabricType,
      work,
      waistSize,
      petticoatLength,
      manufacturer,
      quantity,
    }

    try {
      await fetch(`/api/admin/products/${id}/petticoat-kurtis/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      router.push(`/shop-manager-dashboard/products/${id}`)
    } catch (error) {
      console.error("Failed to create petticoat kurti:", error)
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
            onClick={() => router.push(`/shop-manager-dashboard/products/${id}`)}
            className="bg-white border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add Petticoat Kurti</h1>
              <p className="text-sm text-gray-600">Create a new petticoat kurti entry for {product?.name}</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-medium text-gray-900">Petticoat Kurti Details</CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details for the new petticoat kurti entry
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
                  <Label htmlFor="petticoatFabricType" className="text-sm font-medium text-gray-700">
                    Petticoat Fabric Type
                  </Label>
                  <Select value={petticoatFabricType} onValueChange={setPetticoatFabricType} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Fabric Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {petticoatFabricOptions.map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-gray-50">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            </div>

            {/* Measurements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="waistSize" className="text-sm font-medium text-gray-700">
                    Waist Size
                  </Label>
                  <Select value={waistSize} onValueChange={setWaistSize} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {waistSizeOptions.map((size) => (
                        <SelectItem key={size} value={size} className="hover:bg-gray-50">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petticoatLength" className="text-sm font-medium text-gray-700">
                    Petticoat Length
                  </Label>
                  <Select value={petticoatLength} onValueChange={setPetticoatLength} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Length" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {petticoatLengthOptions.map((length) => (
                        <SelectItem key={length} value={length} className="hover:bg-gray-50">
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Manufacturing Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Manufacturing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                    Manufacturer
                  </Label>
                  <Input
                    id="manufacturer"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
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
                onClick={() => router.push(`/shop-manager-dashboard/products/${id}`)}
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
                    Create Petticoat Kurti Entry
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
