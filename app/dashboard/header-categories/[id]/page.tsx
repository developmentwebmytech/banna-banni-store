import EditHeaderCategoryClientPage from "./edit-header-category-client-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <EditHeaderCategoryClientPage id={id} />
}
