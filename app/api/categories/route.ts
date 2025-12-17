import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Category } from "@/app/lib/models/category"
import fs from "fs"
import path from "path"

// GET categories
export async function GET() {
  await connectDB()
  const categories = await Category.find().sort({ createdAt: -1 })
  return NextResponse.json(categories)
}

// POST with file upload
export async function POST(req: Request) {
  await connectDB()

  const formData = await req.formData()
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const file = formData.get("image") as File | null

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  let imageUrl = null

  if (file) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    fs.mkdirSync(uploadDir, { recursive: true })

    const fileName = `${Date.now()}_${file.name}`
    const filePath = path.join(uploadDir, fileName)

    await fs.promises.writeFile(filePath, buffer)

    imageUrl = `/uploads/${fileName}`
  }

  const newCategory = await Category.create({
    name,
    description,
    images: imageUrl,
  })

  return NextResponse.json(newCategory, { status: 201 })
}
