import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WebMCPTools from "@/components/webmcp/WebMCPTools";
import { SITE } from "@/lib/constants";
import { loadColors, colorsToCSS } from "@/lib/colors";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "greek", "greek-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Gozu Studio | Luxury Architecture & Interior Design",
    template: "%s | Gozu Studio",
  },
  description: SITE.description,
  keywords: [
    "luxury architecture Europe",
    "interior design services Europe",
    "luxury interior design",
    "residential architect",
    "architecture and interior design",
    "luxury residential architect",
    "sustainable architecture",
    "minimalist interior design",
    "bespoke interior design",
    "luxury home design",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE.url,
    siteName: SITE.name,
    title: "Gozu Studio | Luxury Architecture & Interior Design",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gozu Studio | Luxury Architecture & Interior Design",
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96" },
    ],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const cssVars = colorsToCSS(loadColors());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/gozustudio-logo.svg`,
    description: SITE.description,
    founder: {
      "@type": "Person",
      name: SITE.founder,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.email,
      contactType: "customer service",
    },
    sameAs: [SITE.instagram],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        {/* GA4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7BJ23T92B7"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7BJ23T92B7');
            `,
          }}
        />
        {/* Color palette */}
        <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />
        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <WebMCPTools />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
