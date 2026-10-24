import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSeoMetadata, getSeoSetting } from '../src/lib/seo';
import SeoScriptRenderer from '../src/components/common/SeoScriptRenderer';
import FloatingAppDownloadButtons from '../src/components/common/FloatingAppDownloadButtons';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('GLOBAL');
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let globalSeo = null;
  try {
    const record = await getSeoSetting('GLOBAL');
    if (record) globalSeo = record.toJSON();
  } catch (error) {
    console.error('Failed to load global SEO scripts:', error);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <SeoScriptRenderer code={globalSeo?.headerScript} location="head" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <FloatingAppDownloadButtons />
        <SeoScriptRenderer code={globalSeo?.footerScript} location="body" />
      </body>
    </html>
  );
}

