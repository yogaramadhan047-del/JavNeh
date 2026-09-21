"use client";

import { usePathname } from "next/navigation";
import { RawAdUnit } from "./raw-ad-unit";
import { IframeAdUnit } from "./iframe-ad-unit";

export function HeaderBanners({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={`w-full flex flex-col xl:flex-row items-center justify-center gap-4 my-6 ${className}`}>
      <IframeAdUnit placementKey="headerBanner1" />
      <IframeAdUnit placementKey="headerBanner2" />
    </div>
  );
}

export function FooterBanners({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={`w-full bg-background-dark/30 border-t border-border-dark py-6 my-8 flex flex-col xl:flex-row items-center justify-center gap-4 ${className}`}>
      <IframeAdUnit placementKey="footerBanner1" />
      <IframeAdUnit placementKey="footerBanner2" />
    </div>
  );
}

export function MovieDetailBanner({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={`w-full flex justify-center my-6 ${className}`}>
      <IframeAdUnit placementKey="movieDetailBanner" />
    </div>
  );
}

export function InArticleBanner({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <RawAdUnit placementKey="articleBanner" className={className} />;
}

export function ArticleDetailBanner({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return <RawAdUnit placementKey="articleBanner" className={className} />;
}

export function SidebarBanner({
  mobileOnly = false,
  desktopOnly = false,
  className = "",
}: {
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <RawAdUnit
      placementKey="sidebarBanner"
      mobileOnly={mobileOnly}
      desktopOnly={desktopOnly}
      className={className}
    />
  );
}
