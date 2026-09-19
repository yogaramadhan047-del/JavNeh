import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Anime & Drama Jepang - XStream21",
  description: "Cari anime dan drama Jepang berdasarkan judul, genre, atau tahun rilis di XStream21.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
