"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Tag, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getPlaceholderImage, getImageUrl } from "@/app/lib/utils"

interface Product {
  _id?: string
  name?: string
  title?: string
  price: number | string
  total_price?: number | string
  stock?: number
  images?: { url: string; alt?: string }[]
  image?: string
  slug?: string
  gst?: string
}

interface CartItem {
  id: string
  quantity: number
  product: Product
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Form state
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipcode, setZipcode] = useState("")
  const [country, setCountry] = useState("India")
  const [countryCode, setCountryCode] = useState("+91")
  const [mobileNumber, setMobileNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")

  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const [countriesData, setCountriesData] = useState<any[]>([])
  const [statesData, setStatesData] = useState<any[]>([])
  const [filteredStates, setFilteredStates] = useState<any[]>([])

  useEffect(() => {
    fetchCart()
    fetchUserData()
    loadRazorpayScript()
    fetchLocationData()
  }, [])

  const loadRazorpayScript = () => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
  }

  const fetchUserData = async () => {
    try {
      // For v0 environment, simulate user data
      if (typeof window !== "undefined" && window.location.hostname.includes("lite.vusercontent.net")) {
        // Mock logged-in user data
        const mockUser = {
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
        }
        setEmail(mockUser.email)
        setFirstName(mockUser.firstName)
        setLastName(mockUser.lastName)
        // Mock default address
        const mockAddress = {
          address: "123 Main Street, Apartment 4B",
          city: "Mumbai",
          state: "Maharashtra",
          zipcode: "400001",
          country: "India",
          countryCode: "+91",
          mobileNumber: "9876543210",
        }
        setAddress(mockAddress.address)
        setCity(mockAddress.city)
        setState(mockAddress.state)
        setZipcode(mockAddress.zipcode)
        setCountry(mockAddress.country)
        setCountryCode(mockAddress.countryCode)
        setMobileNumber(mockAddress.mobileNumber)
        return
      }

      // Production - fetch user data from profile API
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          if (data?.user) {
            setEmail(data.user.email || "")
            setFirstName(data.user.firstName || "")
            setLastName(data.user.lastName || "")
          }
        } else {
          console.error("Profile fetch failed:", response.status, await response.text())
        }
      } catch (profileError) {
        console.error("Profile fetch error:", profileError)
      }

      // Fetch default address with better error handling
      try {
        console.log("Fetching default address...")
        const addressResponse = await fetch("/api/user/default-address", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        })
        console.log("Address response status:", addressResponse.status)
        if (addressResponse.ok) {
          const addressData = await addressResponse.json()
          console.log("Address data received:", addressData)
          if (addressData?.address) {
            console.log("Setting address fields...")
            setAddress(addressData.address.address || "")
            setCity(addressData.address.city || "")
            setState(addressData.address.state || "")
            setZipcode(addressData.address.zipcode || "")
            setCountry(addressData.address.country || "India")
            setCountryCode(addressData.address.countryCode || "+91")
            setMobileNumber(addressData.address.mobileNumber || "")
            console.log("Address fields set successfully")
          } else {
            console.log("No default address found")
          }
        } else {
          const errorText = await addressResponse.text()
          console.error("Default address fetch failed:", addressResponse.status, errorText)
        }
      } catch (addressError) {
        console.error("Address fetch error:", addressError)
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error)
      // Silently fail - user can still fill form manually
    }
  }

  const fetchCart = async () => {
    try {
      /* 1️⃣  Detect v0 preview ("Next.js") and inject a mock cart */
      if (typeof window !== "undefined" && window.location.hostname.includes("lite.vusercontent.net")) {
        const mockCart: CartItem[] = [
          {
            id: "demo-item-1",
            quantity: 1,
            product: {
              name: "Demo Product 1",
              title: "Demo Product 1",
              price: 199,
              total_price: 215, // Updated to use total_price
              images: [
                {
                  url: getPlaceholderImage("Demo Product 1", 80, 80), // Use getPlaceholderImage
                  alt: "Demo product 1",
                },
              ],
            },
          },
          {
            id: "demo-item-2",
            quantity: 2,
            product: {
              name: "Demo Product 2",
              title: "Demo Product 2",
              price: 99,
              total_price: 114, // Updated to use total_price
              image: getPlaceholderImage("Demo Product 2", 80, 80), // Use getPlaceholderImage
            },
          },
          {
            id: "demo-item-3",
            quantity: 1,
            product: {
              name: "Demo Product 3",
              title: "Demo Product 3",
              price: 250,
              total_price: 285, // Updated to use total_price
              images: [
                {
                  url: "https://via.placeholder.com/80x80.png?text=External+Image",
                  alt: "External Demo Image",
                },
              ],
            },
          },
        ]
        setCartItems(mockCart)
        return
      }

      /* 2️⃣  Production – call your real API */
      const response = await fetch("/api/cart")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      /* 3️⃣  Try to parse JSON safely */
      let data: any
      try {
        data = await response.json()
      } catch (err) {
        console.error("Non-JSON response from /api/cart:", err)
        throw new Error("Invalid JSON from /api/cart")
      }

      if (!data?.cart || data.cart.length === 0) {
        router.push("/cart")
        return
      }

      setCartItems(data.cart as CartItem[])
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast.error("Failed to load cart items")
      router.push("/cart")
    }
  }

  const fetchLocationData = async () => {
    try {
      const [countriesRes, statesRes] = await Promise.all([
        fetch("/api/locations/countries"),
        fetch("/api/locations/states"),
      ])

      const [countriesResult, statesResult] = await Promise.all([countriesRes.json(), statesRes.json()])

      if (countriesResult.success) {
        setCountriesData(countriesResult.data)
      }
      if (statesResult.success) {
        setStatesData(statesResult.data)
      }
    } catch (error) {
      console.error("Failed to fetch location data:", error)
    }
  }

  useEffect(() => {
    if (country && statesData.length > 0) {
      const selectedCountryData = countriesData.find((c) => c.name === country)
      if (selectedCountryData) {
        const filtered = statesData.filter(
          (state) =>
            state.country &&
            (state.country._id === selectedCountryData._id || state.country === selectedCountryData._id),
        )
        setFilteredStates(filtered)
      }
    } else {
      setFilteredStates([])
    }
    // Reset state when country changes
    setState("")
  }, [country, statesData, countriesData])

  const parsePrice = (price: number | string): number => {
    if (typeof price === "string") {
      return Number.parseFloat(price.replace(/[^\d.]/g, ""))
    }
    return price
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parsePrice(item.product.total_price || item.product.price)
      return total + price * item.quantity
    }, 0)
  }

  const getGSTDetails = () => {
    const subtotal = getSubtotal()
    const storeState = "Gujarat" // Store is located in Gujarat
    const deliveryState = state

    // Calculate total GST from all products
    let totalGSTRate = 0
    let gstAmount = 0
    let totalItems = 0

    cartItems.forEach((item) => {
      // Assuming GST rate is stored in product or default to 18%
      const productGSTRate = item.product.gst ? Number.parseFloat(item.product.gst.replace("%", "")) : 18
      const itemPrice = parsePrice(item.product.total_price || item.product.price)
      const itemSubtotal = itemPrice * item.quantity

      // Calculate base price (price without GST)
      const basePrice = itemSubtotal / (1 + productGSTRate / 100)
      const itemGSTAmount = itemSubtotal - basePrice

      gstAmount += itemGSTAmount
      totalGSTRate += productGSTRate * item.quantity
      totalItems += item.quantity
    })

    const avgGSTRate = totalItems > 0 ? totalGSTRate / totalItems : 18

    // Determine GST breakdown based on delivery state
    if (deliveryState === storeState) {
      // Same state: CGST + SGST (split equally)
      return {
        baseAmount: subtotal - gstAmount,
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: 0,
        totalGST: gstAmount,
        gstType: "CGST + SGST",
        cgstRate: avgGSTRate / 2,
        sgstRate: avgGSTRate / 2,
        igstRate: 0,
      }
    } else {
      // Different state: IGST
      return {
        baseAmount: subtotal - gstAmount,
        cgst: 0,
        sgst: 0,
        igst: gstAmount,
        totalGST: gstAmount,
        gstType: "IGST",
        cgstRate: 0,
        sgstRate: 0,
        igstRate: avgGSTRate,
      }
    }
  }

  const getFinalTotal = () => {
    const subtotal = getSubtotal()
    const shipping = 0 // Free shipping
    return subtotal - discountAmount + shipping
  }

  const applyPromoCode = async () => {
    if (!promoCode) {
      toast.error("Please enter a coupon code")
      return
    }

    setCouponError(null)
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode,
          orderTotal: getSubtotal(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setDiscountAmount(data.coupon.discountAmount)
        setAppliedCoupon(data.coupon)
        setCouponError(null)
        toast.success(
          `Coupon "${promoCode}" applied successfully! You saved ₹${data.coupon.discountAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        )
      } else {
        setCouponError(data.error)
        setDiscountAmount(0)
        setAppliedCoupon(null)
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      setCouponError("Failed to validate coupon. Please try again.")
      setDiscountAmount(0)
      setAppliedCoupon(null)
      toast.error("Failed to validate coupon")
    }
  }

  const removeCoupon = () => {
    setPromoCode("")
    setDiscountAmount(0)
    setCouponError(null)
    setAppliedCoupon(null)
    toast.success("Coupon removed")
  }

  const createOrder = async (orderData: any) => {
    try {
      console.log("Creating order with data:", orderData)
      // For v0 environment, simulate order creation without API call
      if (typeof window !== "undefined" && window.location.hostname.includes("lite.vusercontent.net")) {
        console.log("Running in v0 environment - simulating order creation")
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // Generate mock order response
        const mockOrder = {
          success: true,
          order: {
            _id: `order_${Date.now()}`,
            orderId: `ORD${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            ...orderData,
            status: "pending", // All orders start as pending
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          message: "Order created successfully",
        }
        console.log("Mock order created:", mockOrder)
        return mockOrder
      }

      // Regular API call for production
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })
      console.log("Response status:", response.status)

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON Response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("Order created successfully:", data)
      return data
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      // For v0 environment, simulate cart clearing
      if (typeof window !== "undefined" && window.location.hostname.includes("lite.vusercontent.net")) {
        console.log("Running in v0 environment - simulating cart clear")
        setCartItems([])
        return
      }

      // Clear all items from cart in production
      for (const item of cartItems) {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        })
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const initiateRazorpayPayment = async (orderData: any) => {
    try {
      // For v0 environment, simulate payment flow
      if (typeof window !== "undefined" && window.location.hostname.includes("lite.vusercontent.net")) {
        console.log("Running in v0 environment - simulating payment")
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        // Create order with completed payment status
        const finalOrderData = {
          ...orderData,
          paymentId: `pay_${Date.now()}`,
          paymentStatus: "completed",
          razorpayOrderId: mockOrderId,
        }
        await createOrder(finalOrderData)
        await clearCart()
        toast.success("Payment successful! Order placed.")
        router.push(`/order-success?orderId=${mockOrderId}`)
        return
      }

      // Regular Razorpay flow for production
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getFinalTotal(),
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Razorpay order response:", data)

      if (!data.order || !data.razorpayKeyId) {
        throw new Error("Invalid response from payment service")
      }

      const { order, razorpayKeyId } = data

      const options = {
        key: razorpayKeyId, // Use key from server response instead of environment variable
        amount: order.amount,
        currency: order.currency,
        name: "Your Store Name",
        description: "Purchase from Your Store",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyResponse.ok) {
              // Payment verified, create order
              const finalOrderData = {
                ...orderData,
                paymentId: response.razorpay_payment_id,
                paymentStatus: "completed",
                razorpayOrderId: response.razorpay_order_id,
              }
              await createOrder(finalOrderData)
              await clearCart()
              toast.success("Payment successful! Order placed.")
              router.push(`/order-success?orderId=${response.razorpay_order_id}`)
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            toast.error("Payment verification failed. Please contact support.")
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: `${countryCode}${mobileNumber}`,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment was cancelled by user")
          },
        },
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded")
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Error initiating payment:", error)
      toast.error("Failed to initiate payment. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // Validate form fields
    if (!firstName || !lastName || !address || !city || !state || !zipcode || !mobileNumber || !email) {
      toast.error("Please fill in all required fields")
      return
    }

    const orderData = {
      customer: {
        email,
        firstName,
        lastName,
        phone: `${countryCode} ${mobileNumber}`,
      },
      shippingAddress: {
        address,
        city,
        state,
        zipcode,
        country,
      },
      items: cartItems.map((item) => ({
        productId: item.product._id || item.id,
        productName: item.product.name || item.product.title,
        price: parsePrice(item.product.total_price || item.product.price),
        quantity: item.quantity,
        total: parsePrice(item.product.total_price || item.product.price) * item.quantity,
        image: item.product.images?.[0]?.url || item.product.image,
      })),
      subtotal: getSubtotal(),
      discount: discountAmount,
      total: getFinalTotal(),
      paymentMethod,
      promoCode: appliedCoupon?.code || null,
      paymentStatus: paymentMethod === "cod" ? "pending" : "processing",
    }

    try {
      if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        await createOrder(orderData)
        await clearCart()
        toast.success("Order placed successfully! You'll pay when you receive your items.")
        router.push("/order-success?payment=cod")
      } else {
        // Handle online payments via Razorpay
        await initiateRazorpayPayment(orderData)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order. Please try again.")
    }
  }

  const subtotal = getSubtotal()
  const finalTotal = getFinalTotal()

  return (
    <main className="min-h-screen bg-gray-50">
      <ToastContainer position="bottom-right" />

      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="text-gray-600 hover:text-gray-900">
              ← Return to cart
            </Link>
          </div>
          <h1 className="text-lg font-medium text-gray-900">Checkout</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Contact</h2>
                  <span className="text-sm text-gray-500">
                    Have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700">
                      Log in
                    </Link>
                  </span>
                </div>
                <div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Email me with news and offers</span>
                  </label>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery</h2>

                {/* Country/Region */}
                <div className="mb-4">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                    Country/Region
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-full h-12 px-4 border border-gray-300 rounded-md">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {countriesData.map((countryItem) => (
                        <SelectItem key={countryItem._id} value={countryItem.name}>
                          {countryItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <Input
                    id="address"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Input
                      id="city"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="w-full h-12 px-4 border border-gray-300 rounded-md">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {filteredStates.map((stateItem) => (
                          <SelectItem key={stateItem._id} value={stateItem.name}>
                            {stateItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      id="zipcode"
                      placeholder="ZIP code"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      required
                      className="w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <div className="flex">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-24 h-12 px-2 border border-gray-300 rounded-l-md border-r-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+61">+61</SelectItem>
                        <SelectItem value="+81">+81</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="mobileNumber"
                      placeholder="Phone"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                      className="flex-1 h-12 px-4 border border-gray-300 rounded-r-md border-l-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping method</h2>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-600 rounded-full bg-blue-600 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Standard Shipping</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">FREE</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">5-7 business days</p>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment</h2>
                <div className="text-xs text-gray-500 mb-4">All transactions are secure and encrypted.</div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {/* Cash on Delivery */}
                  <div
                    className={`border rounded-md ${paymentMethod === "cod" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center">
                        <RadioGroupItem value="cod" id="cod" className="text-blue-600" />
                        <Label htmlFor="cod" className="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
                          Cash on delivery (COD)
                        </Label>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                        <div className="pt-4">
                          <p className="text-sm text-gray-600 mb-2">Pay with cash when your order is delivered.</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Please keep exact amount ready</li>
                            <li>• Delivery in 5-7 business days</li>
                            <li>• Receipt provided upon payment</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Online Payment */}
                  <div
                    className={`border rounded-md ${paymentMethod === "online" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center">
                        <RadioGroupItem value="online" id="online" className="text-blue-600" />
                        <Label htmlFor="online" className="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
                          Credit card
                        </Label>
                      </div>
                    </div>
                    {paymentMethod === "online" && (
                      <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                        <div className="pt-4">
                          <p className="text-sm text-gray-600 mb-2">Pay securely using UPI, Cards, Net Banking</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Powered by Razorpay</li>
                            <li>• 256-bit SSL encryption</li>
                            <li>• Instant payment confirmation</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>

              {/* Complete Order Button */}
              <Button
                type="submit"
                className="w-full h-14 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Complete order
              </Button>
            </form>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 lg:sticky lg:top-8">
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => {
                  const imageSrc = getImageUrl(item.product?.images?.[0] || item.product?.image || "")
                  const imageAlt = item.product?.name || item.product?.title || "Product"
                  const itemPrice = parsePrice(item.product.total_price || item.product.price)

                  return (
                    <div key={item.id || index} className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                          <Image
                            src={imageSrc || "/placeholder.svg"}
                            alt={imageAlt}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.product.name || item.product.title}
                        </h3>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹
                        {(itemPrice * item.quantity).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Discount code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 h-12 px-4 border border-gray-300 rounded-l-md border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={discountAmount > 0}
                  />
                  {discountAmount > 0 ? (
                    <Button
                      className="h-12 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-r-md border-l-0"
                      onClick={removeCoupon}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      className="h-12 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-r-md border-l-0"
                      onClick={applyPromoCode}
                    >
                      Apply
                    </Button>
                  )}
                </div>
                {couponError && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {couponError}
                  </div>
                )}
                {appliedCoupon && discountAmount > 0 && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {appliedCoupon.code} applied
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                {/* Order Summary */}
                <div className="space-y-3">
                  {(() => {
                    const gstDetails = getGSTDetails()
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Price</span>
                          <span className="text-gray-900">
                            ₹
                            {gstDetails.baseAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        {state && gstDetails.totalGST > 0 && (
                          <>
                            {gstDetails.cgst > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">CGST ({gstDetails.cgstRate.toFixed(1)}%)</span>
                                <span className="text-gray-900">
                                  ₹
                                  {gstDetails.cgst.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            )}
                            {gstDetails.sgst > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">SGST ({gstDetails.sgstRate.toFixed(1)}%)</span>
                                <span className="text-gray-900">
                                  ₹
                                  {gstDetails.sgst.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            )}
                            {gstDetails.igst > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">IGST ({gstDetails.igstRate.toFixed(1)}%)</span>
                                <span className="text-gray-900">
                                  ₹
                                  {gstDetails.igst.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount</span>
                            <span>
                              -₹
                              {discountAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span className="text-green-600 font-medium">FREE</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-gray-900">Total</span>
                          <span className="text-lg font-medium text-gray-900">
                            <span className="text-sm text-gray-500 mr-2">INR</span>₹
                            {finalTotal.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
