import { Package, Category } from '../db/models';
import { getBaseUrl } from './sitemap';
import { getSeoSetting } from './seo';

function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates comprehensive llms.txt adhering to https://llmstxt.org.
 * Includes complete course curriculum breakdown, learning outcomes,
 * training tracks, platform links, and machine-readable resources.
 */
export async function generateLlmsTxt(): Promise<string> {
  const baseUrl = getBaseUrl();

  const [packages, categories, globalSeo] = await Promise.all([
    Package.findAll({
      where: { status: 'PUBLISHED' },
      order: [['createdAt', 'DESC']],
    }),
    Category.findAll({
      order: [['name', 'ASC']],
    }),
    getSeoSetting('GLOBAL'),
  ]);

  const siteTitle = globalSeo?.title || 'Flymedia Academy LMS';
  const siteDesc =
    globalSeo?.description ||
    'Premier learning management system offering industry-aligned software engineering bootcamps, mentor-led live classes, and professional certifications.';

  let out = `# ${siteTitle}\n\n`;
  out += `> ${siteDesc}\n\n`;

  // 1. Detailed Course Catalog & Curriculum
  out += `## Courses & Curriculum Breakdown\n\n`;
  if (packages.length === 0) {
    out += `- No active courses published yet.\n\n`;
  } else {
    for (const pkg of packages) {
      out += `### ${pkg.title}\n`;
      out += `- URL: ${baseUrl}/packages/${pkg.slug}\n`;
      if (pkg.level) out += `- Level: ${pkg.level}\n`;
      if (pkg.duration) out += `- Duration: ${pkg.duration}\n`;
      if (pkg.price) out += `- Price: ₹${pkg.price}\n`;
      if (pkg.mode) out += `- Learning Mode: ${pkg.mode}\n`;
      out += `- Description: ${stripHtml(pkg.description)}\n`;

      if (Array.isArray(pkg.whatYoullLearn) && pkg.whatYoullLearn.length > 0) {
        out += `- Learning Outcomes:\n`;
        for (const item of pkg.whatYoullLearn) {
          out += `  * ${item}\n`;
        }
      }

      if (Array.isArray(pkg.courseModules) && pkg.courseModules.length > 0) {
        out += `- Modules & Syllabus:\n`;
        for (const mod of pkg.courseModules) {
          out += `  * ${mod.title}${Array.isArray(mod.topics) && mod.topics.length > 0 ? `: ${mod.topics.join(', ')}` : ''}\n`;
        }
      }

      if (Array.isArray(pkg.skills) && pkg.skills.length > 0) {
        out += `- Skills Acquired: ${pkg.skills.join(', ')}\n`;
      }

      out += `\n`;
    }
  }

  // 2. Training Categories / Tracks
  if (categories.length > 0) {
    out += `## Training Tracks & Specializations\n`;
    for (const cat of categories) {
      const catDesc = stripHtml(cat.metaDescription);
      out += `- [${cat.name}](${baseUrl}/packages/category/${cat.slug})${catDesc ? `: ${catDesc}` : ''}\n`;
    }
    out += `\n`;
  }

  // 3. Core Navigation Links
  out += `## Core Platform Links\n`;
  out += `- [All Courses & Bootcamps](${baseUrl}/packages): Explore all training packages and bootcamps\n`;
  out += `- [Become an Instructor](${baseUrl}/become-tutor): Apply to teach and mentor students\n`;
  out += `- [About Us](${baseUrl}/about): Learn about Flymedia Academy\n`;
  out += `- [Contact Us](${baseUrl}/contact): Student support and admissions inquiries\n`;
  out += `- [FAQ](${baseUrl}/faq): Frequently asked questions\n`;
  out += `- [Terms of Service](${baseUrl}/terms): Terms and conditions\n`;
  out += `- [Privacy Policy](${baseUrl}/privacy): Privacy policy\n`;
  out += `- [Cookie Policy](${baseUrl}/cookies): Cookie policy\n\n`;

  // 4. Machine-Readable Resources
  out += `## Machine-Readable Resources\n`;
  out += `- [Sitemap](${baseUrl}/sitemap.xml): Dynamic XML Sitemap with all platform URLs\n`;
  out += `- [Robots.txt](${baseUrl}/robots.txt): Search crawler directives\n`;

  return out;
}

/**
 * Backward compatibility alias pointing directly to generateLlmsTxt.
 */
export async function generateLlmsFullTxt(): Promise<string> {
  return generateLlmsTxt();
}
