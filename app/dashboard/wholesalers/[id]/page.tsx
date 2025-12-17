"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { validateWholesaler, type ValidationError } from "@/app/lib/validations/wholesaler"

const productOptions = [
  "3pc Lehenga",
  "2pc Lehenga",
  "Kurti",
  "Gown",
  "Saree",
  "Crop top",
  "Formal wear",
  "Readymade blouse",
  "Dupatta",
  "Footwear",
  "Jewellery",
  "Petticoat",
]

export default function EditWholesaler() {
  const { id } = useParams()
  const router = useRouter()
  const [name, setName] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [area, setArea] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [contactNumbers, setContactNumbers] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [address, setAddress] = useState("")
  const [pincode, setPincode] = useState("")
  const [productsPurchased, setProductsPurchased] = useState<string[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/wholesalers/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data.name)
          setGstNumber(data.gstNumber || "")
          setArea(data.area || "")
          setCity(data.city || "")
          setState(data.state || "")
          setContactNumbers(data.contactNumbers?.join(", ") || "")
          setEmail(data.email || "")
          setWebsite(data.website || "")
          setAddress(data.address || "")
          setPincode(data.pincode || "")
          setProductsPurchased(data.productsPurchased || [])
          setIsLoadingData(false)
        })
        .catch(() => setIsLoadingData(false))
    }
  }, [id])

  const handleProductChange = (product: string, checked: boolean) => {
    setProductsPurchased((prev) => (checked ? [...prev, product] : prev.filter((p) => p !== product)))
  }

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message
  }

  const handleUpdate = async () => {
    // Clear previous errors
    setErrors([])

    const payload = {
      name,
      gstNumber,
      area,
      city,
      state,
      contactNumbers,
      email,
      website,
      address,
      pincode,
      productsPurchased,
    }

    const validationErrors = validateWholesaler(payload)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/wholesalers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          contactNumbers: contactNumbers
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors([{ field: "submit", message: errorData.error || "Failed to update wholesaler" }])
        return
      }

      router.push("/dashboard/wholesalers")
    } catch (error) {
      setErrors([{ field: "submit", message: "An error occurred while updating the wholesaler" }])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Wholesaler</CardTitle>
        <CardDescription>Update the details for this wholesaler.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {errors.some((e) => e.field === "submit") && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.find((e) => e.field === "submit")?.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              WholeSeller Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter wholesaler name"
              className={getFieldError("name") ? "border-red-500" : ""}
            />
            {getFieldError("name") && <span className="text-sm text-red-500">{getFieldError("name")}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gstNumber">GST</Label>
            <Input
              id="gstNumber"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="Enter GST number"
              className={getFieldError("gstNumber") ? "border-red-500" : ""}
            />
            {getFieldError("gstNumber") && <span className="text-sm text-red-500">{getFieldError("gstNumber")}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="area">
              Area <span className="text-red-500">*</span>
            </Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area"
              className={getFieldError("area") ? "border-red-500" : ""}
            />
            {getFieldError("area") && <span className="text-sm text-red-500">{getFieldError("area")}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              className={getFieldError("city") ? "border-red-500" : ""}
            />
            {getFieldError("city") && <span className="text-sm text-red-500">{getFieldError("city")}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Enter state" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactNumbers">Contact Number(s)</Label>
            <Input
              id="contactNumbers"
              value={contactNumbers}
              onChange={(e) => setContactNumbers(e.target.value)}
              placeholder="Enter contact numbers (comma-separated)"
              className={getFieldError("contactNumbers") ? "border-red-500" : ""}
            />
            {getFieldError("contactNumbers") && (
              <span className="text-sm text-red-500">{getFieldError("contactNumbers")}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className={getFieldError("email") ? "border-red-500" : ""}
            />
            {getFieldError("email") && <span className="text-sm text-red-500">{getFieldError("email")}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter website URL"
              className={getFieldError("website") ? "border-red-500" : ""}
            />
            {getFieldError("website") && <span className="text-sm text-red-500">{getFieldError("website")}</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pincode">Pin Code</Label>
          <Input
            id="pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter pincode"
            className={getFieldError("pincode") ? "border-red-500" : ""}
          />
          {getFieldError("pincode") && <span className="text-sm text-red-500">{getFieldError("pincode")}</span>}
        </div>
        <div className="grid gap-2">
          <Label>Product Purchased</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {productOptions.map((product) => (
              <div key={product} className="flex items-center space-x-2">
                <Checkbox
                  id={`product-${product}`}
                  checked={productsPurchased.includes(product)}
                  onCheckedChange={(checked) => handleProductChange(product, checked as boolean)}
                />
                <label
                  htmlFor={`product-${product}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {product}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="bg-teal-800 text-white" onClick={handleUpdate} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Wholesaler"}
        </Button>
      </CardFooter>
    </Card>
  )
}
