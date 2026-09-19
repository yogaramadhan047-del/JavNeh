import { redirect } from "next/navigation";

export default async function ArticlesSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/artikel/${slug}`);
}
