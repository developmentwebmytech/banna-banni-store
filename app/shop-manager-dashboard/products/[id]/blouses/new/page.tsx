"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Save } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

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

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewBlouseForProduct({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [productId, setProductId] = useState<string>("")
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
        fabricType,
        workAndPrint,
        bustSize,
        blouseLength,
        sleeveLength,
        blouseManufacturer,
        quantity,
      }

      const response = await fetch(`/api/admin/products/${productId}/blouses/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to create blouse")
      }

      toast({
        title: "Success",
        description: "Blouse added successfully to the product",
      })

      router.push(`/shop-manager-dashboard/products/${productId}`)
    } catch (error) {
      console.error("Error creating blouse:", error)
      toast({
        title: "Error",
        description: "Failed to create blouse",
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
            onClick={() => router.push(`/shop-manager-dashboard/products/${productId}`)}
            className="bg-white border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add Blouse</h1>
              <p className="text-sm text-gray-600">Create a new blouse entry for this product</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-medium text-gray-900">Blouse Details</CardTitle>
            <CardDescription className="text-gray-600">Enter the details for the new blouse entry</CardDescription>
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
                  <Label htmlFor="fabricType" className="text-sm font-medium text-gray-700">
                    Fabric Type
                  </Label>
                  <Select value={fabricType} onValueChange={setFabricType} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Fabric Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {fabricOptions.map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-gray-50">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            </div>

            {/* Measurements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Measurements</h3>
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
                  <Label htmlFor="blouseLength" className="text-sm font-medium text-gray-700">
                    Blouse Length
                  </Label>
                  <Select value={blouseLength} onValueChange={setBlouseLength} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select Length" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {blouseLengthOptions.map((length) => (
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

            {/* Manufacturing Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Manufacturing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blouseManufacturer" className="text-sm font-medium text-gray-700">
                    Blouse Manufacturer
                  </Label>
                  <Input
                    id="blouseManufacturer"
                    value={blouseManufacturer}
                    onChange={(e) => setBlouseManufacturer(e.target.value)}
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
                onClick={() => router.push(`/shop-manager-dashboard/products/${productId}`)}
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
                    Add Blouse
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
