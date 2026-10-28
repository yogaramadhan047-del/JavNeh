import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FooterBanners } from "@/components/ads/placements";
import { AntiAdBlock } from "@/components/ads/anti-adblock";
import { HeaderAdScripts } from "@/components/ads/header-ad-scripts";
import { AdvertisementProvider } from "@/components/providers/advertisement-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteSettings, getAdSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const baseUrl = SITE_URL.replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(`${baseUrl}/`),

  title: {
    default: `${SITE_NAME} — Katalog Film dan Artikel`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Katalog Film dan Artikel`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Katalog Film dan Artikel`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adSettings, siteSettings] = await Promise.all([
    getAdSettings("advertisement"),
    getSiteSettings("general"),
  ]);

  return (
    <html lang="id" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background-dark text-text-main min-h-screen flex flex-col transition-colors duration-300 w-full max-w-[100vw] overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <AdvertisementProvider initialSettings={adSettings}>
            <HeaderAdScripts />
            {siteSettings?.bannerActive && siteSettings?.bannerText && (
              <div className="w-full bg-primary-blue text-white px-4 py-2 text-center text-sm font-medium transition-all shadow-sm">
                <span>{siteSettings.bannerText}</span>
              </div>
            )}
            <Navbar />
            <AntiAdBlock />
            <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
              {children}
              <div className="mt-auto">
                <FooterBanners />
              </div>
            </main>
            <Footer />
          </AdvertisementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
