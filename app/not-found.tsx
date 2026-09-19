"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <FileQuestion className="w-24 h-24 text-primary-blue mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-text-main">404</h1>
      <h2 className="text-2xl font-semibold mb-4 text-text-muted-hover">Movie Not Found</h2>
      <p className="text-text-muted mb-8 max-w-md">
        Maaf, halaman atau film yang Anda cari tidak dapat ditemukan. Mungkin telah dihapus atau URL salah.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-primary-blue text-white px-8 py-3 rounded-full font-medium hover:bg-primary-blue-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue"
      >
        Back to Home
      </Link>
    </div>
  );
}
