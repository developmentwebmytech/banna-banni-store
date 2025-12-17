// Validation utility for wholesaler
export interface ValidationError {
  field: string
  message: string
}

export const validateWholesaler = (data: {
  name?: string
  gstNumber?: string
  area?: string
  city?: string
  state?: string
  contactNumbers?: string
  email?: string
  website?: string
  address?: string
  pincode?: string
  productsPurchased?: string[]
}): ValidationError[] => {
  const errors: ValidationError[] = []

  // Required field validations
  if (!data.name || data.name.trim() === "") {
    errors.push({ field: "name", message: "Wholesaler name is required" })
  }

  if (!data.area || data.area.trim() === "") {
    errors.push({ field: "area", message: "Area is required" })
  }

  if (!data.city || data.city.trim() === "") {
    errors.push({ field: "city", message: "City is required" })
  }

  // Email validation (if provided)
  if (data.email && data.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" })
    }
  }


  // Pincode validation (if provided)
  if (data.pincode && data.pincode.trim() !== "") {
    const pincodeRegex = /^[0-9]{5,6}$/
    if (!pincodeRegex.test(data.pincode)) {
      errors.push({ field: "pincode", message: "Pincode must be 5-6 digits" })
    }
  }


 

  return errors
}
