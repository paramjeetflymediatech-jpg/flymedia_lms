import { Category, Package } from '../../../../src/db/models';
import { Op } from 'sequelize';
import { notFound } from 'next/navigation';
import Header from '../../../../src/components/layout/Header';
import Footer from '../../../../src/components/layout/Footer';
import PublicFilterForm from '../../../../src/components/packages/PublicFilterForm';
import Link from 'next/link';
import SplitText from '../../../../src/components/animations/SplitText';
import GsapReveal from '../../../../src/components/animations/GsapReveal';

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
  let themeColor = 'indigo';
  let heroLayout = 'centered';
  let heroBgImage = '';
  let heroImage = '';
  
  if (category.content) {
    try {
      dynamicContent = JSON.parse(category.content);
      if (dynamicContent.themeColor) themeColor = dynamicContent.themeColor;
      if (dynamicContent.heroLayout) heroLayout = dynamicContent.heroLayout;
      if (dynamicContent.heroBgImage) heroBgImage = dynamicContent.heroBgImage;
      if (dynamicContent.heroImage) heroImage = dynamicContent.heroImage;
    } catch (e) {
      isLegacyHtml = true;
    }
  }

  // Determine glow colors based on themeColor
  let glow1 = 'bg-indigo-500/20';
  let glow2 = 'bg-orange-500/20';
  
  if (themeColor === 'emerald') { glow1 = 'bg-emerald-500/20'; glow2 = 'bg-teal-500/20'; }
  else if (themeColor === 'rose') { glow1 = 'bg-rose-500/20'; glow2 = 'bg-pink-500/20'; }
  else if (themeColor === 'blue') { glow1 = 'bg-blue-500/20'; glow2 = 'bg-cyan-500/20'; }
  else if (themeColor === 'amber') { glow1 = 'bg-amber-500/20'; glow2 = 'bg-yellow-500/20'; }
  else if (themeColor === 'purple') { glow1 = 'bg-purple-500/20'; glow2 = 'bg-fuchsia-500/20'; }

  const renderTextContent = () => (
    <div className={`space-y-8 relative z-10 ${heroLayout !== 'centered' ? 'text-left' : 'text-center mx-auto'}`}>
      <GsapReveal animation={heroLayout === 'image-left' ? 'slideRight' : heroLayout === 'image-right' ? 'slideLeft' : 'slideUp'} duration={1}>
        {category.icon && (
          <div className={`inline-block p-4 bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl mb-4 ${heroLayout !== 'centered' ? 'mx-0' : 'mx-auto'}`}>
            <img src={category.icon} alt={category.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl" />
          </div>
        )}
      </GsapReveal>
      
      <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight ${heroLayout !== 'centered' ? 'max-w-2xl' : ''}`}>
        <SplitText text={category.name} delay={0.2} />
      </h1>
      
      {category.metaDescription && (
        <GsapReveal animation="slideUp" delay={0.6} duration={1}>
          <p className={`text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed ${heroLayout === 'centered' ? 'max-w-3xl mx-auto' : 'max-w-2xl'}`}>
            {category.metaDescription}
          </p>
        </GsapReveal>
      )}
    </div>
  );

  const renderImageContent = () => (
    <div className="relative z-10 w-full h-full flex items-center justify-center mt-12 lg:mt-0">
      <GsapReveal animation={heroLayout === 'image-left' ? 'slideRight' : 'slideLeft'} duration={1} delay={0.4}>
        <div className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-slate-800/50 backdrop-blur-md">
          {heroImage ? (
            <img src={heroImage} alt={category.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-slate-500">
              <svg className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold">No Image Uploaded</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
        </div>
      </GsapReveal>
    </div>
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-white min-h-screen pb-24">
        {/* Dynamic Category Hero Section */}
        <div className="relative pt-16 pb-24 lg:pt-10 lg:pb-16 overflow-hidden bg-slate-900 border-b border-slate-800 min-h-[60vh] flex items-center">
          {/* Background Image or Glows */}
          {heroBgImage ? (
            <div className="absolute inset-0 z-0">
              <img src={heroBgImage} alt="Background" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/90 backdrop-blur-[2px]" />
            </div>
          ) : (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
              <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] ${glow1} blur-[120px] rounded-full mix-blend-screen transition-colors duration-1000`} />
              <div className={`absolute top-[20%] -right-[10%] w-[40%] h-[50%] ${glow2} blur-[120px] rounded-full mix-blend-screen transition-colors duration-1000`} />
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {heroLayout === 'centered' ? (
              <div className="text-center max-w-5xl mx-auto">
                {renderTextContent()}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                {heroLayout === 'image-left' ? (
                  <>
                    {renderImageContent()}
                    {renderTextContent()}
                  </>
                ) : (
                  <>
                    {renderTextContent()}
                    {renderImageContent()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 -mt-10 relative z-20">
          
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Available Programs</h2>
            
            <PublicFilterForm 
              actionPath={`/packages/category/${category.slug}`}
              currentMode={modeParam} 
            />
          </div>

          {packages.length === 0 ? (
            <GsapReveal animation="zoomIn" duration={0.8}>
              <div className="text-center p-16 bg-white rounded-3xl border border-slate-100 shadow-xl max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-slate-900 font-extrabold text-2xl mb-3">No programs available yet</p>
                <p className="text-slate-500 text-lg">Check back soon for new {category.name} courses.</p>
              </div>
            </GsapReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, idx) => (
                <GsapReveal key={pkg.id} animation="slideUp" delay={idx * 0.1} duration={0.8}>
                  <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative">
                      <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
                        {pkg.thumbnail ? (
                          <img src={pkg.thumbnail} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 ease-out" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <svg className="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                        
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black rounded-lg shadow-lg uppercase tracking-wider">
                            {pkg.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col relative bg-white">
                        <div className="absolute -top-6 right-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500 z-20">
                          <svg className="w-5 h-5 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                          {pkg.title}
                        </h3>
                        <p className="text-slate-500 text-base mb-8 line-clamp-2 flex-1 font-medium leading-relaxed">
                          {pkg.description.replace(/<[^>]*>?/gm, '')}
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:border-orange-200 group-hover:text-orange-600 transition-colors">
                            {pkg.mode === 'BOTH' ? 'ONLINE & OFFLINE' : pkg.mode}
                          </span>
                          <span className="font-black text-xl text-slate-900 group-hover:text-orange-600 transition-colors">
                            {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </GsapReveal>
              ))}
            </div>
          )}
        </div>

        {/* Gorgeous Content Section (Section Wise) */}
        {(dynamicContent?.htmlContent || isLegacyHtml) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 mt-10">
            <div 
              className="prose max-w-none prose-slate mx-auto whitespace-pre-wrap
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <GsapReveal animation="slideUp" duration={1}>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 text-center mb-16 tracking-tight">Why Choose This Category?</h2>
            </GsapReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dynamicContent.features.map((feature: any, idx: number) => (
                <GsapReveal key={idx} animation="slideUp" delay={0.2 + (idx * 0.1)} duration={0.8}>
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner relative z-10">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 relative z-10">{feature.title}</h3>
                    <p className="text-slate-600 text-lg leading-relaxed relative z-10">{feature.description}</p>
                  </div>
                </GsapReveal>
              ))}
            </div>
          </div>
        )}

        {dynamicContent && dynamicContent.sections && dynamicContent.sections.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 space-y-16 lg:space-y-24">
            {dynamicContent.sections.map((section: any, idx: number) => {
              const secLayout = section.layout || 'centered';
              const textContent = (
                <div className={`max-w-4xl space-y-6 ${secLayout !== 'centered' ? 'text-left' : 'text-center mx-auto'}`}>
                  <h3 className={`text-2xl md:text-3xl font-black ${section.bgImage ? 'text-white' : 'text-slate-900'} tracking-tight leading-tight`}>{section.heading}</h3>
                  <div className={`w-20 h-1.5 bg-orange-500 rounded-full ${secLayout !== 'centered' ? 'mx-0' : 'mx-auto'}`} />
                  <div 
                    className={`prose max-w-none font-medium leading-relaxed whitespace-pre-wrap ${section.bgImage ? 'prose-invert prose-p:text-slate-200 prose-headings:text-white prose-strong:text-white prose-li:text-slate-200' : 'prose-slate prose-p:text-slate-600 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-li:text-slate-600'}`} 
                    dangerouslySetInnerHTML={{ __html: section.body }} 
                  />
                </div>
              );

              const imageContent = section.image && (secLayout === 'image-left' || secLayout === 'image-right') && (
                <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <img src={section.image} alt={section.heading} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                </div>
              );

              return (
                <GsapReveal key={idx} animation={idx % 2 === 0 ? "slideRight" : "slideLeft"} duration={1}>
                  <div className={`relative overflow-hidden rounded-[3rem] shadow-xl shadow-slate-200/20 border border-slate-100 ${section.bgImage ? '' : section.bgColor === 'white' ? 'bg-white' : 'bg-slate-50'}`}>
                    {section.bgImage && (
                      <div className="absolute inset-0 z-0">
                        <img src={section.bgImage} className="w-full h-full object-cover" alt="Section BG" />
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                      </div>
                    )}
                    <div className="relative z-10 p-10 md:p-16">
                      {secLayout === 'centered' ? (
                        <div className="flex flex-col items-center">
                          {textContent}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                          {secLayout === 'image-left' ? (
                            <>
                              {imageContent}
                              {textContent}
                            </>
                          ) : (
                            <>
                              {textContent}
                              {imageContent}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </GsapReveal>
              );
            })}
          </div>
        )}

        {dynamicContent && dynamicContent.faqs && dynamicContent.faqs.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-24">
            <GsapReveal animation="slideUp" duration={1}>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 text-center mb-16 tracking-tight">Frequently Asked Questions</h2>
            </GsapReveal>
            <div className="space-y-6">
              {dynamicContent.faqs.map((faq: any, idx: number) => (
                <GsapReveal key={idx} animation="slideUp" delay={idx * 0.1} duration={0.6}>
                  <details className="group bg-white border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/20 overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-orange-200 transition-colors">
                    <summary className="flex items-center justify-between p-8 cursor-pointer hover:bg-slate-50 transition-colors">
                      <h3 className="text-xl font-bold text-slate-900 pr-8">{faq.question}</h3>
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-open:rotate-180 group-open:bg-orange-50 group-open:text-orange-600 transition-all duration-500 flex-shrink-0 shadow-inner">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </summary>
                    <div className="p-8 pt-0 text-slate-600 text-lg leading-relaxed border-t border-slate-50 mt-2 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  </details>
                </GsapReveal>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
