import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SeoSetting } from '../src/db/models';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "Flymedia Academy LMS - Professional Training & Bootcamp",
  description: "A premium learning management system for software engineers and technology professionals. Enroll in our summer bootcamp courses.",
};

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
    console.error('Failed to load global SEO:', error);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {globalSeo?.headerScript && (
          <script dangerouslySetInnerHTML={{ __html: globalSeo.headerScript }} />
        )}
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        {globalSeo?.footerScript && (
          <script dangerouslySetInnerHTML={{ __html: globalSeo.footerScript }} />
        )}
      </body>
    </html>
  );
}
