"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calculator } from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

const financialYearOptions = ["2023-24", "2024-25", "2025-26", "2026-27"]

interface Wholesaler {
  _id: string
  name: string
  city?: string
  contactNumbers?: string[]
}

export default function NewInvoice() {
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [wholesalerId, setWholesalerId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [grossAmount, setGrossAmount] = useState<number>(0)
  const [gstPercentage, setGstPercentage] = useState<number>(18)
  const [otherCost, setOtherCost] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [description, setDescription] = useState("")
  const [financialYear, setFinancialYear] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const gstAmount = (grossAmount * gstPercentage) / 100
  const totalAmount = grossAmount + gstAmount + otherCost - discount

  useEffect(() => {
    const fetchWholesalers = async () => {
      try {
        const response = await fetch("/api/admin/wholesalers")
        if (response.ok) {
          const data = await response.json()
          setWholesalers(data)
        }
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

    // Set default date to today
    const today = new Date().toISOString().split("T")[0]
    setPurchaseDate(today)

    // Set default financial year
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const defaultFY =
      currentMonth >= 3
        ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
        : `${currentYear - 1}-${currentYear.toString().slice(-2)}`
    setFinancialYear(defaultFY)
  }, [toast])

  const handleSubmit = async () => {
    // Validation
    if (!wholesalerId || !purchaseDate || !grossAmount || !financialYear) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!autoGenerate && !invoiceNumber) {
      toast({
        title: "Error",
        description: "Please enter an invoice number or enable auto-generation",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        invoiceNumber: autoGenerate ? "" : invoiceNumber,
        wholesalerId,
        purchaseDate,
        grossAmount: Number(grossAmount),
        gstPercentage: Number(gstPercentage),
        otherCost: Number(otherCost),
        discount: Number(discount),
        description,
        financialYear,
        autoGenerate,
      }

      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create invoice")
      }

      toast({
        title: "Success",
        description: `Invoice ${result.invoiceNumber} created successfully`,
      })

      router.push("/shop-manager-dashboard/invoices")
    } catch (error: any) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/shop-manager-dashboard/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Invoice - Add</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Enter the details for the new invoice.</CardDescription>
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
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoGenerate"
                checked={autoGenerate}
                onCheckedChange={(checked) => setAutoGenerate(checked as boolean)}
              />
              <Label htmlFor="autoGenerate" className="text-sm">
                Auto-generate invoice number
              </Label>
            </div>
            {!autoGenerate && (
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number (e.g., Y123)"
                required={!autoGenerate}
              />
            )}
            {autoGenerate && <Input value="Auto-generated on save" disabled className="bg-gray-100 text-gray-500" />}
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
          <Button variant="outline" onClick={() => router.push("/shop-manager-dashboard/invoices")} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="bg-teal-800 text-white" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
