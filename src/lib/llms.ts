import { Package, BlogPost, Category, User, SeoSetting } from '../db/models';
import { getBaseUrl } from './sitemap';

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
 * Generates dynamic llms.txt adhering to the https://llmstxt.org specification.
 * Provides a structured summary of courses, blogs, mentors, and site resources for LLMs.
 */
export async function generateLlmsTxt(): Promise<string> {
  const baseUrl = getBaseUrl();

  const [packages, blogs, categories, mentors, globalSeo] = await Promise.all([
    Package.findAll({
      where: { status: 'PUBLISHED' },
      attributes: ['title', 'slug', 'description', 'level', 'duration', 'skills', 'price'],
      order: [['createdAt', 'DESC']],
    }),
    BlogPost.findAll({
      where: { status: 'PUBLISHED' },
      attributes: ['title', 'slug', 'excerpt', 'category', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    }),
    Category.findAll({
      attributes: ['name', 'slug', 'metaDescription'],
      order: [['name', 'ASC']],
    }),
    User.findAll({
      where: { role: 'TUTOR' },
      attributes: ['id', 'name', 'professionTitle', 'bio', 'skills'],
      order: [['createdAt', 'DESC']],
    }),
    SeoSetting.findOne({ where: { pagePath: 'GLOBAL' } }),
  ]);

  const siteTitle = globalSeo?.title || 'Flymedia Academy LMS';
  const siteDesc =
    globalSeo?.description ||
    'Premier learning management system offering industry-aligned software engineering bootcamps, mentor-led live classes, and professional certifications.';

  let out = `# ${siteTitle}\n\n`;
  out += `> ${siteDesc}\n\n`;

  // 1. Courses / Bootcamps
  out += `## Courses & Bootcamps\n`;
  if (packages.length === 0) {
    out += `- No active courses published yet.\n`;
  } else {
    for (const pkg of packages) {
      const metaParts = [
        pkg.level,
        pkg.duration,
        pkg.price ? `₹${pkg.price}` : null,
      ].filter(Boolean);
      const metaStr = metaParts.length > 0 ? ` (${metaParts.join(' | ')})` : '';
      const cleanDesc = stripHtml(pkg.description);
      const shortDesc = cleanDesc.length > 160 ? cleanDesc.slice(0, 160) + '...' : cleanDesc;
      out += `- [${pkg.title}](${baseUrl}/packages/${pkg.slug})${metaStr}: ${shortDesc}\n`;
    }
  }

  // 2. Training Categories
  if (categories.length > 0) {
    out += `\n## Training Programs & Tracks\n`;
    for (const cat of categories) {
      const catDesc = stripHtml(cat.metaDescription);
      out += `- [${cat.name}](${baseUrl}/packages/category/${cat.slug})${catDesc ? `: ${catDesc}` : ''}\n`;
    }
  }

  // 3. Blog & Articles
  if (blogs.length > 0) {
    out += `\n## Blog & Engineering Guides\n`;
    for (const b of blogs) {
      const excerpt = stripHtml(b.excerpt);
      out += `- [${b.title}](${baseUrl}/blog/${b.slug})${excerpt ? `: ${excerpt}` : ''}\n`;
    }
  }

  // 4. Mentors & Instructors
  if (mentors.length > 0) {
    out += `\n## Mentors & Instructors\n`;
    for (const m of mentors) {
      const title = m.professionTitle ? ` - ${m.professionTitle}` : '';
      const skillsStr = Array.isArray(m.skills) && m.skills.length > 0 ? ` (Skills: ${m.skills.join(', ')})` : '';
      out += `- [${m.name || 'Mentor'}](${baseUrl}/mentors/${m.id})${title}${skillsStr}\n`;
    }
  }

  // 5. Core Navigation Links
  out += `\n## Core Platform Links\n`;
  out += `- [All Courses](${baseUrl}/packages): Explore all training packages and bootcamps\n`;
  out += `- [Mentors Directory](${baseUrl}/mentors): Connect with instructors and industry mentors\n`;
  out += `- [Become a Tutor](${baseUrl}/become-tutor): Apply to teach and mentor students\n`;
  out += `- [About Us](${baseUrl}/about): Learn about Flymedia Academy\n`;
  out += `- [Contact](${baseUrl}/contact): Student support and inquiries\n`;
  out += `- [FAQ](${baseUrl}/faq): Frequently asked questions\n`;
  out += `- [Terms of Service](${baseUrl}/terms): Terms and conditions\n`;
  out += `- [Privacy Policy](${baseUrl}/privacy): Privacy policy\n`;

  // 6. Optional References
  out += `\n## Machine-Readable Resources\n`;
  out += `- [Full LLMS Details](${baseUrl}/llms-full.txt): Comprehensive course modules and syllabus breakdown\n`;
  out += `- [Sitemap](${baseUrl}/sitemap.xml): Dynamic XML Sitemap with 5,000 URLs pagination\n`;
  out += `- [Robots.txt](${baseUrl}/robots.txt): Search crawler directives\n`;

  return out;
}

/**
 * Generates an extended llms-full.txt with complete module topics, what you'll learn, and FAQs.
 */
export async function generateLlmsFullTxt(): Promise<string> {
  const baseUrl = getBaseUrl();

  const [packages, blogs, categories, mentors, globalSeo] = await Promise.all([
    Package.findAll({
      where: { status: 'PUBLISHED' },
      order: [['createdAt', 'DESC']],
    }),
    BlogPost.findAll({
      where: { status: 'PUBLISHED' },
      order: [['createdAt', 'DESC']],
    }),
    Category.findAll({
      order: [['name', 'ASC']],
    }),
    User.findAll({
      where: { role: 'TUTOR' },
      order: [['createdAt', 'DESC']],
    }),
    SeoSetting.findOne({ where: { pagePath: 'GLOBAL' } }),
  ]);

  const siteTitle = globalSeo?.title || 'Flymedia Academy LMS';
  const siteDesc =
    globalSeo?.description ||
    'Premier learning management system offering industry-aligned software engineering bootcamps, mentor-led live classes, and professional certifications.';

  let out = `# ${siteTitle} (Full Documentation)\n\n`;
  out += `> ${siteDesc}\n\n`;

  out += `## Detailed Course Catalog & Curriculum\n\n`;
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
    out += `\n`;
  }

  if (categories.length > 0) {
    out += `## Training Tracks\n`;
    for (const cat of categories) {
      out += `- [${cat.name}](${baseUrl}/packages/category/${cat.slug})\n`;
    }
    out += `\n`;
  }

  if (mentors.length > 0) {
    out += `## Mentors & Faculty\n`;
    for (const m of mentors) {
      out += `- ${m.name || 'Mentor'} (${m.professionTitle || 'Instructor'})\n`;
      if (m.bio) out += `  Bio: ${stripHtml(m.bio)}\n`;
    }
    out += `\n`;
  }

  return out;
}
