"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/app/hooks/use-toast"
import jsPDF from "jspdf"

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  total: number
  image?: string
}

interface Order {
  _id: string
  orderId: string
  userId: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    state: string
    zipcode: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  promoCode?: string
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

// Define the export data structure
interface ExportData {
  "S.No": number
  "Order ID": string
  "Customer Name": string
  Email: string
  Phone: string
  Address: string
  Country: string
  "Items Count": number
  "Items Details": string
  Subtotal: number
  Discount: number
  "Total Amount": number
  "Payment Method": string
  "Payment Status": string
  "Order Status": string
  "Promo Code": string
  "Tracking Number": string
  "Estimated Delivery": string
  "Order Date": string
  "Last Updated": string
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [deleting, setDeleting] = useState(false)

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/orders")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      const orderList = Array.isArray(data) ? data : (data.orders ?? [])
      setOrders(orderList)
    } catch (err) {
      console.error("Orders fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setUpdateDialogOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF()

    // Set page margins
    const leftMargin = 20
    const rightMargin = 190
    const pageWidth = 210

    // Company Header - Center the INVOICE heading
    doc.setFontSize(24)
    doc.setTextColor(40, 40, 40)
    doc.text("INVOICE", pageWidth / 2, 30, { align: "center" })

    // Invoice Details (Right side) - Change to left alignment
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const rightStart = 120
    doc.text("Invoice #:", rightStart, 50)
    doc.text(`INV-${order.orderId}`, rightStart + 25, 50)
    doc.text("Order #:", rightStart, 58)
    doc.text(order.orderId, rightStart + 25, 58)
    doc.text("Date:", rightStart, 66)
    doc.text(formatDate(order.createdAt), rightStart + 25, 66)
    doc.text("Status:", rightStart, 74)
    doc.text(order.status.toUpperCase(), rightStart + 25, 74)

    // Customer Details (Left side)
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("BILL TO:", leftMargin, 105)
    doc.setFontSize(10)
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, leftMargin, 115)
    doc.text(order.customer.email, leftMargin, 123)
    doc.text(order.customer.phone, leftMargin, 131)

    // Shipping Address (Right side)
    doc.setFontSize(12)
    doc.text("SHIP TO:", rightStart, 105)
    doc.setFontSize(10)
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, rightStart, 115)

    // Handle long addresses by splitting them
    const address = order.shippingAddress.address
    if (address.length > 30) {
      const addressLines = address.match(/.{1,30}(\s|$)/g) || [address]
      addressLines.forEach((line, index) => {
        doc.text(line.trim(), rightStart, 123 + index * 8)
      })
    } else {
      doc.text(address, rightStart, 123)
    }

    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, rightStart, 131)
    doc.text(`${order.shippingAddress.zipcode}, ${order.shippingAddress.country}`, rightStart, 139)

    // Table Header
    let yPos = 160
    doc.setFillColor(240, 240, 240)
    doc.rect(leftMargin, yPos - 8, rightMargin - leftMargin, 12, "F")

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("ITEM", leftMargin + 2, yPos)
    doc.text("QTY", 120, yPos)
    doc.text("PRICE", 140, yPos)
    doc.text("TOTAL", 165, yPos)

    // Items
    yPos += 15
    doc.setFontSize(9)

    order.items.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
        // Redraw header on new page
        doc.setFillColor(240, 240, 240)
        doc.rect(leftMargin, yPos - 8, rightMargin - leftMargin, 12, "F")
        doc.setFontSize(10)
        doc.text("ITEM", leftMargin + 2, yPos)
        doc.text("QTY", 120, yPos)
        doc.text("PRICE", 140, yPos)
        doc.text("TOTAL", 165, yPos)
        yPos += 15
        doc.setFontSize(9)
      }

      // Handle long product names
      const productName = item.productName
      if (productName.length > 35) {
        const nameLines = productName.match(/.{1,35}(\s|$)/g) || [productName]
        doc.text(nameLines[0].trim(), leftMargin + 2, yPos)
        if (nameLines[1]) {
          doc.text(nameLines[1].trim(), leftMargin + 2, yPos + 6)
        }
      } else {
        doc.text(productName, leftMargin + 2, yPos)
      }

      // Right align numbers
      doc.text(item.quantity.toString(), 125, yPos, { align: "right" })
      doc.text(`₹${item.price.toFixed(2)}`, 155, yPos, { align: "right" })
      doc.text(`₹${item.total.toFixed(2)}`, 185, yPos, { align: "right" })

      yPos += productName.length > 35 ? 18 : 12
    })

    // Totals section
    yPos += 10
    doc.setLineWidth(0.5)
    doc.line(leftMargin, yPos, rightMargin, yPos)
    yPos += 15

    doc.setFontSize(10)

    // Subtotal
    doc.text("Subtotal:", 140, yPos)
    doc.text(`₹${order.subtotal.toFixed(2)}`, 185, yPos, { align: "right" })
    yPos += 10

    // Discount (if any)
    if (order.discount > 0) {
      doc.setTextColor(0, 150, 0)
      doc.text("Discount:", 140, yPos)
      doc.text(`-₹${order.discount.toFixed(2)}`, 185, yPos, { align: "right" })
      yPos += 10
      doc.setTextColor(0, 0, 0)
    }

    // Shipping
    doc.text("Shipping:", 140, yPos)
    doc.setTextColor(0, 150, 0)
    doc.text("FREE", 185, yPos, { align: "right" })
    doc.setTextColor(0, 0, 0)
    yPos += 15

    // Total (highlighted)
    doc.setFontSize(12)
    doc.setFillColor(240, 240, 240)
    doc.rect(135, yPos - 8, 55, 12, "F")
    doc.text("TOTAL:", 140, yPos)
    doc.setTextColor(0, 0, 0)
    doc.text(`₹${order.total.toFixed(2)}`, 185, yPos, { align: "right" })

    // Payment Information
    yPos += 25
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("PAYMENT INFORMATION:", leftMargin, yPos)
    yPos += 10
    doc.text(`Method: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}`, leftMargin, yPos)
    yPos += 8
    doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, leftMargin, yPos)

    // Footer
    yPos += 20
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text("Thank you for your business!", leftMargin, yPos)
    doc.text("For any queries, contact us at support@company.com", leftMargin, yPos + 8)

    // Download
    doc.save(`Invoice-${order.orderId}.pdf`)
    toast({
      title: "Success",
      description: "Invoice downloaded successfully!",
    })
  }

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update status")
      }

      toast({
        title: "Success",
        description: "Order status updated successfully!",
      })
      fetchOrders()
    } catch (err) {
      console.error("Status update error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdateDialogOpen(false)
      setSelectedOrder(null)
      setNewStatus("")
    }
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderToDelete._id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Order deleted successfully!",
        })
        // Remove the deleted order from state immediately
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderToDelete._id))
      } else {
        throw new Error(data.error || "Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete order",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "shipped":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No Data",
        description: "No orders to export",
        variant: "destructive",
      })
      return
    }

    // Prepare data for Excel with proper typing
    const excelData: ExportData[] = filteredOrders.map((order, index) => ({
      "S.No": index + 1,
      "Order ID": order.orderId,
      "Customer Name": `${order.customer.firstName} ${order.customer.lastName}`,
      Email: order.customer.email,
      Phone: order.customer.phone,
      Address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipcode}`,
      Country: order.shippingAddress.country,
      "Items Count": order.items.length,
      "Items Details": order.items
        .map((item) => `${item.productName} (Qty: ${item.quantity}, Price: ₹${item.price})`)
        .join("; "),
      Subtotal: order.subtotal,
      Discount: order.discount,
      "Total Amount": order.total,
      "Payment Method": order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
      "Payment Status": order.paymentStatus,
      "Order Status": order.status,
      "Promo Code": order.promoCode || "N/A",
      "Tracking Number": order.trackingNumber || "N/A",
      "Estimated Delivery": order.estimatedDelivery || "N/A",
      "Order Date": formatDate(order.createdAt),
      "Last Updated": formatDate(order.updatedAt),
    }))

    // Convert to CSV format with proper type handling
    const headers = Object.keys(excelData[0]) as (keyof ExportData)[]
    const csvContent = [
      headers.join(","),
      ...excelData.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return String(value)
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Orders_Export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: `Exported ${filteredOrders.length} orders to CSV file!`,
    })
  }

  const handleRefresh = () => {
    setSearchTerm("")
    setStatusFilter("all")
    fetchOrders()
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orders Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={filteredOrders.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV ({filteredOrders.length})
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order ID or customer info"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== "all" ? "No orders match your filters." : "No orders found."}
                    </p>
                    {(searchTerm || statusFilter !== "all") && (
                      <Button variant="outline" size="sm" onClick={handleRefresh}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">#{order.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="relative h-8 w-8 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={item.image || "/shopbycategory1.webp"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs text-gray-500">+{order.items.length - 2}</span>
                      )}
                      <span className="text-sm text-gray-600">({order.items.length} items)</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{order.total.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border`}>
                        {order.paymentStatus}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(order.status)} border`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => generateInvoice(order)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Download Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteOrder(order)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order <strong>#{selectedOrder?.orderId}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete order <strong>#{orderToDelete?.orderId}</strong>?
              <br />
              <span className="text-sm text-red-600 mt-2 block font-medium">
                ⚠️ This action cannot be undone. All order data will be permanently removed.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOrder} disabled={deleting}>
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 p-1">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(selectedOrder.status)} border`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1 capitalize">{selectedOrder.status}</span>
                  </Badge>
                  <Badge className={`${getPaymentStatusColor(selectedOrder.paymentStatus)} border`}>
                    <span className="capitalize">{selectedOrder.paymentStatus}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="text-sm space-y-1 bg-gray-50 p-3 rounded border">
                    <p>
                      {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                    </p>
                    <p>{selectedOrder.customer.email}</p>
                    <p>{selectedOrder.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm space-y-1 bg-gray-50 p-3 rounded border">
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                    <p>{selectedOrder.shippingAddress.zipcode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                      <div className="relative h-16 w-16 bg-white rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.productName}</h5>
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">₹{item.total.toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 bg-gray-50 p-4 rounded border">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-teal-600">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className="text-teal-600">FREE</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery Info */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Payment Information</h4>
                  <div className="bg-gray-50 p-3 rounded border space-y-1">
                    <p>Method: {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                    <p>
                      Status: <span className="capitalize">{selectedOrder.paymentStatus}</span>
                    </p>
                    {selectedOrder.promoCode && <p>Promo Code: {selectedOrder.promoCode}</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delivery Information</h4>
                  <div className="bg-gray-50 p-3 rounded border space-y-1">
                    <p>Estimated: {selectedOrder.estimatedDelivery || "Not set"}</p>
                    {selectedOrder.trackingNumber && <p>Tracking: {selectedOrder.trackingNumber}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
