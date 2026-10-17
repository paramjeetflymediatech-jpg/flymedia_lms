import Link from 'next/link';
import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { Category, Package } from '../../../src/db/models';
import ContactSection from '../../../src/components/contact/ContactSection';
import PageSeoScripts from '../../../src/components/common/PageSeoScripts';
import GsapReveal from '../../../src/components/animations/GsapReveal';
import { Metadata } from 'next';
import { getSeoMetadata } from '../../../src/lib/seo';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/packages/category', {
    title: 'Training Categories | Flymedia Technology',
    description: 'Browse all training program categories from Full Stack Web Development to Digital Marketing and Graphic Designing.',
  });
}

export default async function CategoriesIndexPage() {
  const [categories, packages] = await Promise.all([
    Category.findAll({ order: [['name', 'ASC']] }),
    Package.findAll({ where: { status: 'PUBLISHED' }, attributes: ['category'], raw: true })
  ]);

  // Count packages per category
  const packageCountMap: { [key: string]: number } = {};
  packages.forEach((pkg: any) => {
    if (pkg.category) {
      packageCountMap[pkg.category] = (packageCountMap[pkg.category] || 0) + 1;
    }
  });

  return (
    <>
      <PageSeoScripts path="/packages/category" />
      <Header />
      <main className="flex-1 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Explore Disciplines
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Course Categories
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Browse our diverse training tracks and specialized learning programs tailored for developers, designers, and marketers.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const count = packageCountMap[cat.name] || 0;
              return (
                <GsapReveal key={cat.id} animation="slideUp" delay={idx * 0.05} duration={0.6}>
                  <Link
                    href={`/packages/category/${cat.slug}`}
                    className="group flex flex-col h-full bg-white rounded-3xl border border-slate-200 p-8 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-rose-500/5 rounded-bl-[4rem] -z-0 pointer-events-none" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center p-3 text-orange-600 group-hover:scale-110 transition-transform">
                        {cat.icon ? (
                          <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                            {cat.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        {count} {count === 1 ? 'Program' : 'Programs'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-orange-600 transition-colors relative z-10">
                      {cat.name}
                    </h3>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1 mb-6 relative z-10 line-clamp-3">
                      {cat.metaDescription || `Master essential industry skills in ${cat.name} with live mentors and hands-on projects.`}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative z-10 mt-auto">
                      <span className="text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                        View Programs
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </GsapReveal>
              );
            })}
          </div>

          {/* Contact & Consultation Section */}
          <div className="mt-16">
            <ContactSection 
              title="Need Help Deciding on a Category?"
              subtitle="Our career mentors can evaluate your skill set and recommend the best training discipline to match current industry demands."
              sourceContext="Categories Directory Page"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
