import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  href?: string;
}

export function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="group flex items-center text-sm font-medium text-primary-blue hover:text-text-main transition-colors p-2 -mr-2 rounded-lg hover:bg-white/5"
        >
          Lihat Semua
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
