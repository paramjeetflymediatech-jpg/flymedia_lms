import { headers } from 'next/headers';
import { Faq, Package } from '../../db/models';
import { Op } from 'sequelize';

function getPageKeyFromPathname(pathname: string): { key: string; isPackage: boolean; slug?: string } {
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  
  if (clean === '/') return { key: 'HOME', isPackage: false };
  if (clean === '/about') return { key: 'ABOUT', isPackage: false };
  if (clean === '/partner-with-us') return { key: 'PARTNER', isPackage: false };
  if (clean === '/contact') return { key: 'CONTACT', isPackage: false };
  if (clean === '/gallery') return { key: 'GALLERY', isPackage: false };
  if (clean === '/faq') return { key: 'FAQ_PAGE', isPackage: false };
  
  // Package route: /packages/:slug
  if (clean.startsWith('/packages/') && !clean.startsWith('/packages/category/')) {
    const slug = clean.replace('/packages/', '').trim();
    return { key: 'PACKAGE_DETAIL', isPackage: true, slug };
  }

  // Any other custom page: /careers -> CAREERS
  const segments = clean.split('/').filter(Boolean);
  const firstSegment = segments[0] || 'HOME';
  return { key: firstSegment.toUpperCase().replace(/-/g, '_'), isPackage: false };
}

/**
 * Server component placed explicitly inside <head> in RootLayout.
 * Outputs the Google-compliant FAQPage JSON-LD schema inside the literal HTML <head>.
 */
export default async function DynamicFaqHeadSchema() {
  try {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || headersList.get('next-url') || headersList.get('x-invoke-path') || '/';

    // Do not output FAQ schema on admin or api routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/dashboard')) {
      return null;
    }

    const { key, isPackage, slug } = getPageKeyFromPathname(pathname);
    let faqsList: Array<{ question: string; answer: string }> = [];

    if (isPackage && slug) {
      // Fetch FAQs from Package record
      try {
        const pkg = await Package.findOne({
          where: { slug },
          attributes: ['faqs'],
        });
        if (pkg && (pkg as any).faqs) {
          const raw = (pkg as any).faqs;
          faqsList = Array.isArray(raw)
            ? raw
            : (typeof raw === 'string' ? JSON.parse(raw) : []);
        }
      } catch (err) {
        console.error('Error fetching package FAQs for schema:', err);
      }
    } else if (key === 'FAQ_PAGE') {
      // For /faq, load all active FAQs
      try {
        const records = await Faq.findAll({
          where: { isActive: true },
          order: [['order', 'ASC'], ['createdAt', 'ASC']],
        });
        faqsList = records.map((f) => ({ question: f.question, answer: f.answer }));
      } catch (err) {
        console.error('Error fetching all FAQs for schema:', err);
      }
    } else {
      // Fetch page-specific FAQs where page IN (key, 'GLOBAL')
      try {
        const records = await Faq.findAll({
          where: {
            isActive: true,
            page: { [Op.in]: [key, 'GLOBAL'] },
          },
          order: [['order', 'ASC'], ['createdAt', 'ASC']],
        });
        faqsList = records.map((f) => ({ question: f.question, answer: f.answer }));
      } catch (err) {
        console.error(`Error fetching FAQs for ${key} schema:`, err);
      }
    }


    // Filter valid FAQs
    const validFaqs = faqsList.filter(
      (f) => f && typeof f.question === 'string' && f.question.trim().length > 0 &&
                 typeof f.answer === 'string' && f.answer.trim().length > 0
    );

    if (validFaqs.length === 0) {
      return null;
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: validFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer.replace(/<[^>]*>?/gm, '').trim(),
        },
      })),
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  } catch (error) {
    console.error('Failed to generate head FAQ schema:', error);
    return null;
  }
}
