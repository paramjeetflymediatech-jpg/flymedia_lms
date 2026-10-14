import { Metadata } from 'next';
import { Op } from 'sequelize';
import { SeoSetting } from '../db/models';
import { getBaseUrl } from './sitemap';

/**
 * Normalizes any page path, URL, or identifier entered by admins or code.
 * Examples:
 * - "https://course.flymediatech.com/packages" -> "/packages"
 * - "packages/" -> "/packages"
 * - "home" -> "/"
 * - "GLOBAL" -> "GLOBAL"
 */
export function normalizePath(rawPath?: string | null): string {
  if (!rawPath) return '/';
  let p = rawPath.trim();
  if (!p) return '/';

  // Check for GLOBAL
  if (p.toUpperCase() === 'GLOBAL') {
    return 'GLOBAL';
  }

  // If a full URL was pasted, parse the pathname
  if (p.startsWith('http://') || p.startsWith('https://')) {
    try {
      const url = new URL(p);
      p = url.pathname;
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // Strip query strings and hash anchors
  p = p.split('?')[0].split('#')[0].trim();

  // Handle common home aliases
  if (p === 'home' || p === '/home' || p === 'index' || p === '/index' || p === '') {
    return '/';
  }

  // Ensure leading slash
  if (!p.startsWith('/')) {
    p = '/' + p;
  }

  // Remove multiple consecutive slashes: ///path -> /path
  p = p.replace(/\/+/g, '/');

  // Strip trailing slash if path is longer than 1 character: /packages/ -> /packages
  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1);
  }

  return p.toLowerCase();
}

/**
 * Generates variations of a path to ensure flexible matching in database.
 * This ensures if an admin entered "/packages" or "packages" or "/courses",
 * the query will match seamlessly.
 */
export function getPathVariations(rawPath: string): string[] {
  const normalized = normalizePath(rawPath);
  const variations = new Set<string>();

  if (normalized === 'GLOBAL') {
    variations.add('GLOBAL');
    variations.add('global');
    return Array.from(variations);
  }

  variations.add(normalized);
  variations.add(normalized + '/');
  if (normalized.startsWith('/')) {
    variations.add(normalized.slice(1));
  }

  // Special aliases
  if (normalized === '/') {
    variations.add('/');
    variations.add('');
    variations.add('GLOBAL'); // fallback for homepage if GLOBAL is configured
    variations.add('/home');
    variations.add('home');
  } else if (normalized === '/packages') {
    variations.add('/courses');
    variations.add('/courses/');
    variations.add('courses');
    variations.add('/packages');
    variations.add('/packages/');
    variations.add('packages');
  } else if (normalized.startsWith('/packages/')) {
    const slug = normalized.replace(/^\/packages\//, '');
    variations.add(`/courses/${slug}`);
    variations.add(`/courses/${slug}/`);
  } else if (normalized === '/about') {
    variations.add('/about-us');
    variations.add('/about-us/');
    variations.add('about-us');
  } else if (normalized === '/contact') {
    variations.add('/contact-us');
    variations.add('/contact-us/');
    variations.add('contact-us');
  } else if (normalized === '/faq') {
    variations.add('/faqs');
    variations.add('/faqs/');
    variations.add('faqs');
  }

  return Array.from(variations);
}

let hasCheckedTable = false;

async function ensureSeoTable() {
  if (hasCheckedTable) return;
  try {
    await SeoSetting.sync();
    hasCheckedTable = true;
  } catch (err) {
    console.error('Failed to ensure seo_settings table:', err);
  }
}

/**
 * Robustly queries an SEO setting by matching path variations and aliases.
 */
export async function getSeoSetting(rawPath: string): Promise<SeoSetting | null> {
  const variations = getPathVariations(rawPath);

  try {
    const record = await SeoSetting.findOne({
      where: {
        pagePath: {
          [Op.in]: variations,
        },
      },
      order: [
        // Exact match preferred, then others
        ['updatedAt', 'DESC'],
      ],
    });

    if (record) return record;

    // If searching for homepage and not found, check GLOBAL
    if (normalizePath(rawPath) === '/') {
      const globalRecord = await SeoSetting.findOne({
        where: { pagePath: 'GLOBAL' },
      });
      if (globalRecord) return globalRecord;
    }

    return null;
  } catch (error: any) {
    console.error(`Error querying SeoSetting for path "${rawPath}":`, error?.message || error);
    // If table doesn't exist, try syncing once
    if (!hasCheckedTable) {
      await ensureSeoTable();
      try {
        return await SeoSetting.findOne({
          where: { pagePath: { [Op.in]: variations } },
        });
      } catch {
        return null;
      }
    }
    return null;
  }
}

export interface FallbackSeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

/**
 * Returns a fully computed Next.js Metadata object using database SEO settings
 * with smooth fallback to GLOBAL SEO and developer defaults.
 */
export async function getSeoMetadata(
  pathname: string,
  fallback?: FallbackSeoData
): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const cleanPath = normalizePath(pathname);

  const defaultTitle = "Flymedia Academy LMS - Professional Training & Bootcamp";
  const defaultDescription =
    "A premium learning management system for software engineers and technology professionals. Enroll in our summer bootcamp courses.";

  let seo: any = null;
  let globalSeo: any = null;

  try {
    const [seoRecord, globalRecord] = await Promise.all([
      getSeoSetting(pathname),
      cleanPath !== 'GLOBAL' ? getSeoSetting('GLOBAL') : Promise.resolve(null),
    ]);
    if (seoRecord) seo = seoRecord.toJSON();
    if (globalRecord) globalSeo = globalRecord.toJSON();
  } catch (err) {
    console.error('Error loading metadata in getSeoMetadata:', err);
  }

  // Determine Title: page SEO -> fallback -> global SEO -> default
  const title =
    seo?.title ||
    fallback?.title ||
    globalSeo?.title ||
    defaultTitle;

  // Determine Description
  const description =
    seo?.description ||
    fallback?.description ||
    globalSeo?.description ||
    defaultDescription;

  // Determine Keywords
  let keywords: string[] | undefined;
  if (seo?.keywords) {
    keywords = seo.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
  } else if (fallback?.keywords && fallback.keywords.length > 0) {
    keywords = fallback.keywords;
  } else if (globalSeo?.keywords) {
    keywords = globalSeo.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
  }

  // Determine OG Title & Description
  const ogTitle =
    seo?.ogTitle ||
    seo?.title ||
    fallback?.title ||
    globalSeo?.ogTitle ||
    globalSeo?.title ||
    title;

  const ogDescription =
    seo?.ogDescription ||
    seo?.description ||
    fallback?.description ||
    globalSeo?.ogDescription ||
    globalSeo?.description ||
    description;

  const canonicalUrl = `${baseUrl}${cleanPath === '/' || cleanPath === 'GLOBAL' ? '' : cleanPath}`;

  const ogImages: { url: string }[] = [];
  if (fallback?.ogImage) {
    ogImages.push({ url: fallback.ogImage });
  } else {
    ogImages.push({ url: `${baseUrl}/icon.png` });
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: 'Flymedia Technology LMS',
      images: ogImages,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImages.map(img => img.url),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
