import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a placeholder image URL that works reliably
 */
export function getPlaceholderImage(query = "product", width = 300, height = 300): string {
  // Use a more reliable placeholder service that works everywhere
  return `https://via.placeholder.com/${width}x${height}.png?text=${encodeURIComponent(query)}`
}

/**
 * Checks if a URL is external (starts with http:// or https://)
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}

/**
 * Checks if the image is a base64 data URL
 */
export function isBase64Image(src: string): boolean {
  return src.startsWith("data:image/")
}

/**
 * Gets the proper image URL, handling base64, local and external URLs
 */
export function getImageUrl(src: string): string {
  if (!src) return getPlaceholderImage()

  // Handle base64 images (from admin uploads) - return as-is
  if (isBase64Image(src)) return src

  // If it's already an external URL, return as is
  if (isExternalUrl(src)) return src

  // If it's a local path starting with '/', it's from the public folder
  if (src.startsWith("/")) return src

  // Otherwise, use a placeholder
  return getPlaceholderImage("No Image")
}

/**
 * Gets image props for Next.js Image component with proper optimization settings
 */
export function getImageProps(src: string, alt = "Product Image") {
  const imageUrl = getImageUrl(src)

  return {
    src: imageUrl,
    alt,
    // Disable optimization for base64 images to prevent errors
    unoptimized: isBase64Image(imageUrl),
  }
}
