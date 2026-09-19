import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 min-h-[70vh]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <h1 className="text-4xl font-bold text-text-main mb-6">Kebijakan Privasi</h1>
      <div className="prose prose-invert max-w-none text-text-muted-hover">
        <p className="mb-4">
          Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi
          Anda saat menggunakan situs XStream21.
        </p>
        <h2 className="text-2xl font-bold text-text-main mt-8 mb-4">Pengumpulan Informasi</h2>
        <p className="mb-4">
          Kami tidak mengumpulkan informasi pribadi yang dapat mengidentifikasi Anda secara langsung tanpa izin. Kami
          mungkin menggunakan cookie untuk meningkatkan pengalaman Anda.
        </p>
      </div>
    </div>
  );
}
