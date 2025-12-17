
import EditCategoryClientPage from "./edit-category-client-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <EditCategoryClientPage id={id} />
}
