import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-dark bg-card-dark py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tighter mb-4 flex items-center justify-center">
          <span className="text-white">XStream</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-blue-400">
            21
          </span>
        </h2>
        <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
          Streaming ribuan film dan series subtitle Indonesia secara gratis. Temukan tontonan favoritmu sekarang.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-text-muted-hover">
          <Link href="/about" className="hover:text-text-main transition-colors">About</Link>
          <Link href="/contact" className="hover:text-text-main transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-text-main transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-text-main transition-colors">Terms</Link>
          <Link href="/admin/login" className="hover:text-text-main transition-colors">Admin Login</Link>
        </div>
        <div className="mt-8 text-xs text-text-muted">
          &copy; {new Date().getFullYear()} XStream21. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
