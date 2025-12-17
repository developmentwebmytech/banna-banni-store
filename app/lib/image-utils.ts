import type React from "react"
// Utility functions for handling images
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  // Return placeholder if no image URL provided
  if (!imageUrl || imageUrl.trim() === "") {
    return `/placeholder.svg?height=80&width=80&text=No+Image`
  }

  try {
    // Clean the URL - remove any extra whitespace
    const cleanUrl = imageUrl.trim()

    // If it's already a complete URL with protocol, return as is
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      // Validate the URL
      new URL(cleanUrl)
      return cleanUrl
    }

    // If it's a relative path starting with /, return as is
    if (cleanUrl.startsWith("/")) {
      return cleanUrl
    }

    // If it's just a filename or relative path, prepend with /
    return `/${cleanUrl}`
  } catch (error) {
    console.error("Invalid image URL:", imageUrl, error)
    return `/placeholder.svg?height=80&width=80&text=Invalid+URL`
  }
}

export const getPlaceholderImage = (text: string, width = 80, height = 80): string => {
  const encodedText = encodeURIComponent(text)
  return `/placeholder.svg?height=${height}&width=${width}&text=${encodedText}`
}

// Image error handler for React components
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallbackText?: string) => {
  const target = e.target as HTMLImageElement
  const text = fallbackText || "No+Image"
  target.src = `/placeholder.svg?height=80&width=80&text=${text}`
}

// Validate if an image URL is accessible
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}
