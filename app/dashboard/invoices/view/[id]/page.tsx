"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Download,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  Phone,
  MapPin,
  Clock,
} from "lucide-react"
import { useToast } from "@/app/hooks/use-toast"

interface Invoice {
  _id: string
  invoiceNumber: string
  wholesalerId: {
    _id: string
    name: string
    city?: string
    contactNumbers?: string[]
    gstNumber?: string
    email?: string
  } | null
  purchaseDate: string
  grossAmount: number
  gstPercentage: number
  otherCost: number
  discount: number
  description?: string
  financialYear: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export default function ViewInvoice() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/admin/invoices/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch invoice")
        }
        const data = await response.json()
        setInvoice(data)
      } catch (error) {
        console.error("Error fetching invoice:", error)
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchInvoice()
    }
  }, [id, toast])

  const handleDownloadPDF = async () => {
    if (!invoice) return

    try {
      const response = await fetch(`/api/admin/invoices/${invoice._id}/pdf`)
      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const htmlContent = await response.text()
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.onload = () => {
          printWindow.print()
        }
      }

      toast({
        title: "Success",
        description: "PDF generated successfully",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading invoice details...</span>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Not Found</h1>
        </div>
      </div>
    )
  }

  const gstAmount = (invoice.grossAmount * invoice.gstPercentage) / 100

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
            <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => router.push(`/dashboard/invoices/${invoice._id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Financial Year</label>
                  <Badge variant="secondary" className="mt-1">
                    {invoice.financialYear}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(invoice.purchaseDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                </div>
              </div>

              {invoice.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amount Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Amount Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gross Amount</span>
                  <span className="font-semibold">{formatCurrency(invoice.grossAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GST {invoice.gstPercentage}% </span>
                  <span className="font-semibold">{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Other Cost</span>
                  <span className="font-semibold">{formatCurrency(invoice.otherCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(invoice.discount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-green-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Wholesaler Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Wholesaler Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.wholesalerId ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="font-semibold flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {invoice.wholesalerId.name}
                    </p>
                  </div>

                  {invoice.wholesalerId.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {invoice.wholesalerId.city}
                      </p>
                    </div>
                  )}

                  {invoice.wholesalerId.contactNumbers && invoice.wholesalerId.contactNumbers.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Numbers</label>
                      <div className="space-y-1">
                        {invoice.wholesalerId.contactNumbers.map((number, index) => (
                          <p key={index} className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {number}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {invoice.wholesalerId.gstNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">GST Number</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{invoice.wholesalerId.gstNumber}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">Wholesaler information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Record Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Record Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">{formatDate(invoice.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
