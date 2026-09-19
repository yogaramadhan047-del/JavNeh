import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface AdminBreadcrumbItem {
  label: string;
  href?: string;
}

export function AdminBreadcrumb({ items }: { items: AdminBreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-blue transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-200 font-medium" aria-current="page">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-600 shrink-0" aria-hidden="true" />
          )}
        </div>
      ))}
    </nav>
  );
}
