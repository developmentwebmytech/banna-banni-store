import { NextResponse } from "next/server"
import { connectDB } from "@/app/lib/db"
import HeaderCategory from "@/app/lib/models/headercategory"

// GET header category by slug for public use
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB()
    const { slug } = params

    const category = await HeaderCategory.findOne({
      slug: slug,
      isActive: true,
    })

    if (!category) {
      return NextResponse.json(
        {
          error: "Header category not found or inactive",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          title: category.title,
          description: category.description,
          images: category.images,
          icon: category.icon,
          color: category.color,
          order: category.order,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("GET header category by slug error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch header category",
      },
      { status: 500 },
    )
  }
}
