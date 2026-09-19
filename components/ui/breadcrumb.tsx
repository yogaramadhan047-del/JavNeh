import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-y-1 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="hover:text-text-main transition-colors whitespace-nowrap">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main line-clamp-1 max-w-[200px] sm:max-w-[300px]" aria-current="page" title={item.label}>{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-gray-600 shrink-0" aria-hidden="true" />
          )}
        </div>
      ))}
    </nav>
  );
}
