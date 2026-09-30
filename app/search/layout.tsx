import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Movie & Film - XStream21",
  description: "Cari movie dan film berdasarkan judul, genre, atau tahun rilis di XStream21.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
