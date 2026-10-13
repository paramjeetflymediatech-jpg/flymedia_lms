import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SeoSetting } from '../src/db/models';
import SeoScriptRenderer from '../src/components/common/SeoScriptRenderer';
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const defaultTitle = "Flymedia Academy LMS - Professional Training & Bootcamp";
  const defaultDescription = "A premium learning management system for software engineers and technology professionals. Enroll in our summer bootcamp courses.";

  try {
    const record = await SeoSetting.findOne({ where: { pagePath: 'GLOBAL' } });
    if (record) {
      const globalSeo = record.toJSON();
      return {
        metadataBase: new URL(baseUrl),
        title: globalSeo.title || defaultTitle,
        description: globalSeo.description || defaultDescription,
        keywords: globalSeo.keywords ? globalSeo.keywords.split(',').map((k: string) => k.trim()) : undefined,
        openGraph: {
          title: globalSeo.ogTitle || globalSeo.title || defaultTitle,
          description: globalSeo.ogDescription || globalSeo.description || defaultDescription,
        },
      };
    }
  } catch (error) {
    console.error('Failed to load global SEO metadata:', error);
  }

  return {
    metadataBase: new URL(baseUrl),
    title: defaultTitle,
    description: defaultDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let globalSeo = null;
  try {
    const record = await SeoSetting.findOne({ where: { pagePath: 'GLOBAL' } });
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
        <SeoScriptRenderer code={globalSeo?.footerScript} location="body" />
      </body>
    </html>
  );
}

