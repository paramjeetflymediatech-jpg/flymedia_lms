import type { MetadataRoute } from 'next';
import { getBaseUrl, getSitemapsCount } from '../src/lib/sitemap';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = getBaseUrl();
  let count = 1;
  try {
    count = await getSitemapsCount();
  } catch (e) {
    console.error('Error fetching sitemaps count for robots.txt:', e);
  }

  const sitemaps = Array.from({ length: count }, (_, i) => `${baseUrl}/sitemap/${i}.xml`);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/payment/',
          '/reset-password/',
        ],
      },
    ],
    sitemap: sitemaps.length === 1 ? sitemaps[0] : sitemaps,
  };
}

