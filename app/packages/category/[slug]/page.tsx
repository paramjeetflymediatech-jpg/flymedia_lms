import { Category, Package } from '../../../../src/db/models';
import { Op } from 'sequelize';
import { notFound } from 'next/navigation';
import Header from '../../../../src/components/layout/Header';
import Footer from '../../../../src/components/layout/Footer';
import PublicFilterForm from '../../../../src/components/packages/PublicFilterForm';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = await Category.findOne({ where: { slug: resolvedParams.slug } });
  
  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: category.metaTitle || `${category.name} Courses | Flymedia Technology LMS`,
    description: category.metaDescription || `Explore our specialized ${category.name} courses designed to expand your skill set.`,
    keywords: category.metaKeywords || category.name,
  };
}

export const revalidate = 0;

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = await Category.findOne({ where: { slug: resolvedParams.slug } });
  if (!category) {
    notFound();
  }

  const modeParam = resolvedSearchParams?.mode as string || '';
  const searchParam = resolvedSearchParams?.search as string || '';

  const whereClause: any = { 
    category: category.name,
    status: 'PUBLISHED'
  };
  
  if (modeParam) whereClause.mode = modeParam;
  
  // Basic search filter if needed
  if (searchParam) {
    whereClause.title = { [Op.like]: `%${searchParam}%` };
  }

  const packagesData = await Package.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
  });
  
  const packages = packagesData.map(p => p.toJSON());

  let dynamicContent = null;
  let isLegacyHtml = false;
  if (category.content) {
    try {
      dynamicContent = JSON.parse(category.content);
    } catch (e) {
      isLegacyHtml = true;
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-white min-h-screen pb-24">
        {/* Dynamic Category Hero Section */}
        <div className="bg-slate-50 border-b border-slate-100 py-20 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {category.icon && (
              <img src={category.icon} alt={category.name} className="w-20 h-20 mx-auto object-contain p-2 bg-white rounded-2xl shadow-sm border border-slate-100" />
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
              {category.name}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {category.metaDescription || `Advance your career with our industry-leading ${category.name} training programs and certifications.`}
            </p>
          </div>
        </div>

        {/* Gorgeous Content Section (Section Wise) */}
        {(dynamicContent?.htmlContent || isLegacyHtml) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div 
              className="prose prose-lg md:prose-xl max-w-none prose-slate mx-auto 
                         prose-headings:font-extrabold prose-headings:text-slate-900 prose-headings:tracking-tight
                         prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-3xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4
                         prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-2xl prose-h3:text-slate-800
                         prose-p:text-slate-600 prose-p:leading-relaxed
                         prose-ul:mt-6 prose-ul:space-y-3 prose-li:text-slate-600 prose-li:marker:text-orange-500
                         prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: dynamicContent?.htmlContent || category.content }} 
            />
          </div>
        )}

        {dynamicContent && dynamicContent.features && dynamicContent.features.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Why Choose This Category?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dynamicContent.features.map((feature: any, idx: number) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow text-center">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {dynamicContent && dynamicContent.sections && dynamicContent.sections.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-12">
            {dynamicContent.sections.map((section: any, idx: number) => (
              <div key={idx} className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-extrabold text-slate-900">{section.heading}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{section.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Available Programs</h2>
            
            <PublicFilterForm 
              actionPath={`/packages/category/${category.slug}`}
              currentMode={modeParam} 
            />
          </div>

          {packages.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-700 font-bold text-xl mb-2">No programs available yet</p>
              <p className="text-slate-500">Check back soon for new {category.name} courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {pkg.thumbnail ? (
                      <img src={pkg.thumbnail} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold rounded-lg shadow-sm">
                        {pkg.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {pkg.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">
                      {pkg.description.replace(/<[^>]*>?/gm, '')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                        {pkg.mode}
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price)}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {dynamicContent && dynamicContent.faqs && dynamicContent.faqs.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {dynamicContent.faqs.map((faq: any, idx: number) => (
                <details key={idx} className="group bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900">{faq.question}</h3>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-open:rotate-180 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </summary>
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-2">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
