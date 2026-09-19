import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Film, Users, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-text-main mb-6">Tentang XStream21</h1>

        <p className="text-lg text-text-muted-hover mb-8 leading-relaxed">
          XStream21 adalah platform streaming film dan serial TV gratis yang berdedikasi untuk memberikan pengalaman
          menonton terbaik bagi pengguna di Indonesia. Kami menyediakan koleksi film terbaru dan terpopuler dengan
          subtitle Indonesia yang berkualitas.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
            <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center text-primary-blue mb-4">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">Koleksi Lengkap</h3>
            <p className="text-text-muted">Ribuan judul film dan series dari berbagai genre siap menemani waktu luang Anda.</p>
          </div>
          <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
            <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center text-primary-blue mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">Cepat & Ringan</h3>
            <p className="text-text-muted">Website dioptimasi untuk kecepatan akses dan buffering minimal saat menonton.</p>
          </div>
          <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
            <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center text-primary-blue mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">Aman Digunakan</h3>
            <p className="text-text-muted">Tanpa iklan pop-up yang mengganggu dan berbahaya. Kenyamanan Anda adalah prioritas.</p>
          </div>
          <div className="bg-card-dark p-6 rounded-xl border border-border-dark">
            <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center text-primary-blue mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">Komunitas</h3>
            <p className="text-text-muted">Bergabung dengan ribuan penonton lain, baca artikel, dan temukan rekomendasi film terbaik.</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-main mb-4">Misi Kami</h2>
        <p className="text-text-muted-hover leading-relaxed mb-6">
          Kami percaya bahwa hiburan berkualitas harus dapat diakses oleh semua orang. Oleh karena itu, XStream21 terus
          berinovasi untuk menghadirkan antarmuka pengguna yang modern, bersih, dan mudah digunakan di berbagai perangkat,
          baik desktop maupun mobile.
        </p>
        <h2 className="text-2xl font-bold text-text-main mb-4">Hubungi Kami</h2>
        <p className="text-text-muted-hover leading-relaxed mb-6">
          Punya pertanyaan, saran, atau ingin melaporkan link rusak? Jangan ragu untuk menghubungi tim kami melalui halaman{" "}
          <a href="/contact" className="text-primary-blue hover:underline">
            Contact
          </a>.
        </p>
      </div>
    </div>
  );
}
