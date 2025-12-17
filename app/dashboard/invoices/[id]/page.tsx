"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

const financialYearOptions = ["2023-24", "2024-25", "2025-26", "2026-27"]

interface Wholesaler {
  _id: string
  name: string
  city?: string
  contactNumbers?: string[]
}

export default function EditInvoice() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [wholesalerId, setWholesalerId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [grossAmount, setGrossAmount] = useState<number>(0)
  const [gstPercentage, setGstPercentage] = useState<number>(18)
  const [otherCost, setOtherCost] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [description, setDescription] = useState("")
  const [financialYear, setFinancialYear] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const gstAmount = (grossAmount * gstPercentage) / 100
  const totalAmount = grossAmount + gstAmount + otherCost - discount

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wholesalers
        const wholesalersResponse = await fetch("/api/admin/wholesalers")
        if (wholesalersResponse.ok) {
          const wholesalersData = await wholesalersResponse.json()
          setWholesalers(wholesalersData)
        }

        // Fetch invoice data
        if (id) {
          const invoiceResponse = await fetch(`/api/admin/invoices/${id}`)
          if (invoiceResponse.ok) {
            const invoiceData = await invoiceResponse.json()
            setInvoiceNumber(invoiceData.invoiceNumber)
            setWholesalerId(invoiceData.wholesalerId._id)
            setPurchaseDate(new Date(invoiceData.purchaseDate).toISOString().split("T")[0])
            setGrossAmount(invoiceData.grossAmount)
            setGstPercentage(invoiceData.gstPercentage || 18)
            setOtherCost(invoiceData.otherCost)
            setDiscount(invoiceData.discount)
            setDescription(invoiceData.description || "")
            setFinancialYear(invoiceData.financialYear)
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [id, toast])

  const handleUpdate = async () => {
    // Validation
    if (!wholesalerId || !purchaseDate || !grossAmount || !financialYear || !invoiceNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        invoiceNumber,
        wholesalerId,
        purchaseDate,
        grossAmount: Number(grossAmount),
        gstPercentage: Number(gstPercentage),
        otherCost: Number(otherCost),
        discount: Number(discount),
        description,
        financialYear,
      }

      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update invoice")
      }

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      })

      router.push("/dashboard/invoices")
    } catch (error: any) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading invoice...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Update the details for this invoice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Wholesaler Name */}
          <div className="grid gap-2">
            <Label htmlFor="wholesaler">WholeSeller Name *</Label>
            <Select value={wholesalerId} onValueChange={setWholesalerId} required>
              <SelectTrigger id="wholesaler">
                <SelectValue placeholder="Select Wholesaler" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {wholesalers.map((wholesaler) => (
                  <SelectItem key={wholesaler._id} value={wholesaler._id}>
                    {wholesaler.name} {wholesaler.city && `- ${wholesaler.city}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Number */}
          <div className="grid gap-2">
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
              required
            />
          </div>

          {/* Purchase Date */}
          <div className="grid gap-2">
            <Label htmlFor="purchaseDate">Purchase Date *</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          {/* Financial Year */}
          <div className="grid gap-2">
            <Label htmlFor="financialYear">Invoice's Financial Year *</Label>
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

          {/* Amount Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="grossAmount">Gross Amount *</Label>
              <Input
                id="grossAmount"
                type="number"
                value={grossAmount}
                onChange={(e) => setGrossAmount(Number(e.target.value))}
                placeholder="5000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gstPercentage">GST Percentage (%) *</Label>
              <Input
                id="gstPercentage"
                type="number"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(Number(e.target.value))}
                placeholder="18"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otherCost">Other Cost</Label>
              <Input
                id="otherCost"
                type="number"
                value={otherCost}
                onChange={(e) => setOtherCost(Number(e.target.value))}
                placeholder="150"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="100"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* GST Amount Display (calculated from percentage) */}
          <div className="grid gap-2">
            <Label className="text-sm text-gray-600">GST Amount (Calculated)</Label>
            <Input
              value={`₹${gstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              disabled
              className="bg-gray-100 text-gray-700"
            />
          </div>

          {/* Total Amount Display */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Total Amount (Calculated)
            </Label>
            <Input
              value={`₹${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              disabled
              className="bg-gray-100 text-gray-900 font-semibold"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="N/A"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/invoices")} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="bg-teal-800 text-white" onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Invoice"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
