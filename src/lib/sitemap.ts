import { Package, BlogPost, Category, User, SeoSetting } from '../db/models';
import { Op } from 'sequelize';

export const SITEMAP_PAGE_SIZE = 5000;

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

/**
 * Fetches all site URLs from static definitions and dynamic database entities.
 */
export async function getAllSitemapUrls(): Promise<SitemapEntry[]> {
  const baseUrl = getBaseUrl();
  const urls: SitemapEntry[] = [];
  const seenPaths = new Set<string>();

  const addUrl = (path: string, options: Omit<SitemapEntry, 'url'> = {}) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!seenPaths.has(cleanPath)) {
      seenPaths.add(cleanPath);
      urls.push({
        url: `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`,
        ...options,
      });
    }
  };

  // 1. Static High-Priority Routes
  addUrl('/', { changeFrequency: 'daily', priority: 1.0 });
  addUrl('/packages', { changeFrequency: 'daily', priority: 0.9 });
  addUrl('/blog', { changeFrequency: 'daily', priority: 0.8 });
  addUrl('/mentors', { changeFrequency: 'weekly', priority: 0.8 });
  addUrl('/become-tutor', { changeFrequency: 'monthly', priority: 0.7 });
  addUrl('/about', { changeFrequency: 'monthly', priority: 0.7 });
  addUrl('/contact', { changeFrequency: 'monthly', priority: 0.7 });
  addUrl('/faq', { changeFrequency: 'monthly', priority: 0.6 });
  addUrl('/terms', { changeFrequency: 'yearly', priority: 0.3 });
  addUrl('/privacy', { changeFrequency: 'yearly', priority: 0.3 });
  addUrl('/cookies', { changeFrequency: 'yearly', priority: 0.3 });

  try {
    // 2. Dynamic Published Packages / Courses
    const packages = await Package.findAll({
      where: { status: 'PUBLISHED' },
      attributes: ['slug', 'updatedAt'],
    });
    for (const pkg of packages) {
      if (pkg.slug) {
        addUrl(`/packages/${pkg.slug}`, {
          lastModified: pkg.updatedAt ? new Date(pkg.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }

    // 3. Dynamic Published Blog Posts
    const posts = await BlogPost.findAll({
      where: { status: 'PUBLISHED' },
      attributes: ['slug', 'updatedAt'],
    });
    for (const post of posts) {
      if (post.slug) {
        addUrl(`/blog/${post.slug}`, {
          lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    // 4. Dynamic Categories
    const categories = await Category.findAll({
      attributes: ['slug', 'updatedAt'],
    });
    for (const cat of categories) {
      if (cat.slug) {
        addUrl(`/packages/category/${cat.slug}`, {
          lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    // 5. Dynamic Mentors / Tutors
    const tutors = await User.findAll({
      where: { role: 'TUTOR' },
      attributes: ['id', 'updatedAt'],
    });
    for (const tutor of tutors) {
      if (tutor.id) {
        addUrl(`/mentors/${tutor.id}`, {
          lastModified: tutor.updatedAt ? new Date(tutor.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    // 6. Custom Paths defined in Admin SEO Settings (excluding GLOBAL)
    const customSeo = await SeoSetting.findAll({
      where: { pagePath: { [Op.ne]: 'GLOBAL' } },
      attributes: ['pagePath', 'updatedAt'],
    });
    for (const seo of customSeo) {
      if (seo.pagePath && !seo.pagePath.includes('GLOBAL')) {
        addUrl(seo.pagePath, {
          lastModified: seo.updatedAt ? new Date(seo.updatedAt) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error querying dynamic sitemap URLs from database:', error);
  }

  return urls;
}

/**
 * Calculates total number of sitemap pages needed based on 5000 links per page.
 */
export async function getSitemapsCount(): Promise<number> {
  const urls = await getAllSitemapUrls();
  return Math.max(1, Math.ceil(urls.length / SITEMAP_PAGE_SIZE));
}

/**
 * Returns a specific slice of URLs (up to 5000) for a given page index (0-indexed).
 */
export async function getSitemapPageUrls(pageIndex: number): Promise<SitemapEntry[]> {
  const urls = await getAllSitemapUrls();
  const start = pageIndex * SITEMAP_PAGE_SIZE;
  const end = start + SITEMAP_PAGE_SIZE;
  return urls.slice(start, end);
}

/**
 * Generates XML for a Sitemap Index file listing all paginated sitemaps.
 */
export function generateSitemapIndexXml(baseUrl: string, totalPages: number): string {
  const now = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (let i = 0; i < totalPages; i++) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>`;
  return xml;
}

/**
 * Generates XML for a standard Sitemap URL set.
 */
export function generateUrlsetXml(entries: SitemapEntry[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
    if (entry.lastModified) {
      xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
    }
    if (entry.changeFrequency) {
      xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
    }
    if (typeof entry.priority === 'number') {
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
