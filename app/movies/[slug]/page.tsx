import { redirect } from "next/navigation";
import { getMovieBySlugOrId } from "@/lib/movies";

export default async function MovieSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlugOrId(slug);
  if (movie?.category === "Drama Jepang") {
    redirect(`/drama-jepang/${slug}`);
  }
  redirect(`/anime/${slug}`);
}

