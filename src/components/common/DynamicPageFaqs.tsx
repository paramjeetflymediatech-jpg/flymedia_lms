import { Faq } from '../../db/models';
import { Op } from 'sequelize';
import FaqAccordion from '../home/FaqAccordion';
import Reveal from '../ui/Reveal';
import FaqSchema from '../seo/FaqSchema';

interface DynamicPageFaqsProps {
  page: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
}

export default async function DynamicPageFaqs({
  page,
  title,
  subtitle,
  badgeText = "Frequently Asked Questions",
  className = "",
}: DynamicPageFaqsProps) {
  let dbFaqs: any[] = [];
  const normalizedPage = page.trim().toUpperCase().replace(/\s+/g, '_');

  try {
    const records = await Faq.findAll({
      where: {
        isActive: true,
        page: { [Op.in]: [normalizedPage, 'GLOBAL'] },
      },
      order: [['order', 'ASC'], ['createdAt', 'ASC']],
    });
    dbFaqs = records.map(f => f.toJSON());
  } catch (error) {
    console.error(`Failed to load FAQs for page ${normalizedPage}:`, error);
  }

  const faqsToDisplay = dbFaqs;

  if (faqsToDisplay.length === 0) {
    return null;
  }

  const displayTitle = title || `Frequently Asked Questions`;
  const displaySubtitle = subtitle || `Find quick answers regarding our ${page.toLowerCase().replace(/_/g, ' ')} and training programs.`;

  return (
    <>
      <FaqSchema faqs={faqsToDisplay} />
      <div className={`w-full py-8 ${className}`}>
      <Reveal direction="up">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider">
              <span>❓</span>
              <span>{badgeText}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {displayTitle}
            </h2>
            <p className="text-slate-600 font-medium text-base sm:text-lg max-w-xl mx-auto">
              {displaySubtitle}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80">
            <FaqAccordion faqs={faqsToDisplay} />
          </div>
        </div>
      </Reveal>
    </div>
    </>
  );
}
