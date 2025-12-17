// Utility function to match category names (case-insensitive)
export function matchCategoryName(productCategory: string, targetCategory: string): boolean {
  if (!productCategory || !targetCategory) return false

  // Normalize both strings: lowercase, trim, and remove extra spaces
  const normalizeString = (str: string) => str.toLowerCase().trim().replace(/\s+/g, " ")

  const normalizedProduct = normalizeString(productCategory)
  const normalizedTarget = normalizeString(targetCategory)

  return normalizedProduct === normalizedTarget
}

// Function to generate category slug from name
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

// Function to match category slug with product category
export function matchCategorySlug(categorySlug: string, productCategory: string): boolean {
  const generatedSlug = generateCategorySlug(productCategory)
  return generatedSlug === categorySlug.toLowerCase()
}
