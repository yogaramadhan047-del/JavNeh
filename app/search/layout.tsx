import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Movie & Film - JavNeh",
  description: "Cari movie dan film berdasarkan judul, genre, atau tahun rilis di JavNeh.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
