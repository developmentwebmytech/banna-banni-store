import EditBannerClientPage from "./EditBannerClientPage"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <EditBannerClientPage id={id} />
}
