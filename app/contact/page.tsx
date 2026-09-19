import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ContactPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 min-h-[70vh]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="text-4xl font-bold text-text-main mb-6">Hubungi Kami</h1>
      <p className="text-text-muted-hover mb-8">Silakan isi formulir di bawah ini untuk menghubungi tim kami.</p>
      <form className="space-y-6 bg-card-dark p-6 rounded-xl border border-border-dark">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Nama</label>
          <input
            type="text"
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary-blue outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
          <input
            type="email"
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary-blue outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Pesan</label>
          <textarea
            rows={5}
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary-blue outline-none"
          ></textarea>
        </div>
        <button
          type="button"
          className="bg-primary-blue hover:bg-primary-blue-hover text-white font-medium py-3 px-8 rounded-xl transition-all cursor-pointer"
        >
          Kirim Pesan
        </button>
      </form>
    </div>
  );
}
