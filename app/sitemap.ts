import type { MetadataRoute } from 'next';
import { getAllSitemapUrls } from '../src/lib/sitemap';

export const dynamic = 'force-dynamic';

/**
 * Dynamic single-file sitemap generation for /sitemap.xml.
 * Returns all active URLs across pages, courses, categories, and custom SEO paths.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllSitemapUrls();

  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
