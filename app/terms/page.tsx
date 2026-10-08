import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 min-h-[70vh]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
      <h1 className="text-4xl font-bold text-text-main mb-6">Syarat & Ketentuan</h1>
      <div className="prose prose-invert max-w-none text-text-muted-hover">
        <p className="mb-4">
          Dengan mengakses dan menggunakan situs JavNeh, Anda menyetujui syarat dan ketentuan berikut:
        </p>
        <h2 className="text-2xl font-bold text-text-main mt-8 mb-4">Penggunaan Layanan</h2>
        <p className="mb-4">
          Layanan JavNeh disediakan secara gratis untuk keperluan hiburan. Anda tidak diperkenankan menggunakan situs ini
          untuk tujuan ilegal.
        </p>
      </div>
    </div>
  );
}
