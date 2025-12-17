import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import { Category } from "@/app/lib/models/category"
import fs from "fs"
import path from "path"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const category = await Category.findById(params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const file = formData.get("image") as File | null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updateData: any = {
      name,
      description,
    }

    // Handle image upload if new file provided
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), "public", "uploads")
      fs.mkdirSync(uploadDir, { recursive: true })

      const fileName = `${Date.now()}_${file.name}`
      const filePath = path.join(uploadDir, fileName)

      await fs.promises.writeFile(filePath, buffer)
      updateData.images = `/uploads/${fileName}`
    }

    const updatedCategory = await Category.findByIdAndUpdate(params.id, updateData, { new: true })

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const deletedCategory = await Category.findByIdAndDelete(params.id)

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
