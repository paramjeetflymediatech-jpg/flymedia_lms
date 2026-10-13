import type { MetadataRoute } from 'next';
import { getSitemapsCount, getSitemapPageUrls } from '../src/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Next.js App Router dynamic sitemap generation.
 * Splits site URLs into pages of up to 5,000 links each.
 * Accessible at /sitemap/0.xml, /sitemap/1.xml, etc.
 */
export async function generateSitemaps() {
  const count = await getSitemapsCount();
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = await props.id;
  const pageIndex = resolvedId ? parseInt(resolvedId, 10) : 0;
  const entries = await getSitemapPageUrls(pageIndex);

  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
