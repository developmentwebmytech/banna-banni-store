import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to recursively find all route.ts files
function findRouteFiles(dir, files = []) {
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      findRouteFiles(fullPath, files)
    } else if (item === "route.ts") {
      files.push(fullPath)
    }
  }

  return files
}

// Function to fix params in a file
function fixParamsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8")
  let modified = false

  // Pattern 1: Fix type definitions
  const typePattern = /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([^}]+)\s*\}\s*\}/g
  if (typePattern.test(content)) {
    content = content.replace(typePattern, "{ params }: { params: Promise<{ $1 }> }")
    modified = true
  }

  // Pattern 2: Fix destructuring
  const destructurePattern = /const\s*\{\s*([^}]+)\s*\}\s*=\s*params/g
  if (destructurePattern.test(content)) {
    content = content.replace(destructurePattern, "const { $1 } = await params")
    modified = true
  }

  // Pattern 3: Fix direct access like params.id
  const directAccessPattern = /params\.(\w+)/g
  const matches = content.match(directAccessPattern)
  if (matches) {
    // First, we need to add await params destructuring if not already present
    const paramNames = [...new Set(matches.map((match) => match.split(".")[1]))]
    const destructuring = `const { ${paramNames.join(", ")} } = await params`

    // Check if destructuring already exists
    if (!content.includes("= await params")) {
      // Find the function start and add destructuring
      content = content.replace(/(export\s+async\s+function\s+\w+$$[^)]*$$\s*\{)/, `$1\n  ${destructuring}\n`)

      // Replace direct access with variables
      paramNames.forEach((param) => {
        content = content.replace(new RegExp(`params\\.${param}`, "g"), param)
      })

      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8")
    console.log(`✅ Fixed: ${filePath}`)
    return true
  }

  return false
}

// Main execution
function main() {
  const appDir = path.join(__dirname, "..", "app")

  if (!fs.existsSync(appDir)) {
    console.error("❌ App directory not found. Make sure you run this from your project root.")
    process.exit(1)
  }

  console.log("🔍 Finding route files...")
  const routeFiles = findRouteFiles(appDir)

  console.log(`📁 Found ${routeFiles.length} route files`)

  let fixedCount = 0

  for (const file of routeFiles) {
    if (fixParamsInFile(file)) {
      fixedCount++
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} out of ${routeFiles.length} files`)
  console.log("✨ All route files have been updated for Next.js 15!")
}

main()
