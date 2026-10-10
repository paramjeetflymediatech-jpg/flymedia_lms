import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { Package, LiveClass, Enrollment, User } from '../../../src/db/models';
import { getCurrentUser } from '../../../src/lib/auth';
import PackageEnrollWidget from '../../../src/components/packages/PackageEnrollWidget';
import CourseModuleAccordion from '../../../src/components/packages/CourseModuleAccordion';
import FaqAccordion from '../../../src/components/packages/FaqAccordion';
import CertificateToggle from '../../../src/components/packages/CertificateToggle';

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await Package.findOne({ where: { slug } });
  if (!pkg) return { title: 'Package Not Found' };
  return {
    title: `${pkg.title} | Flymedia Technology`,
    description: pkg.description.slice(0, 160),
    openGraph: {
      title: pkg.title,
      description: pkg.description.slice(0, 160),
      images: pkg.thumbnail ? [{ url: pkg.thumbnail }] : [],
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const pkg = await Package.findOne({
    where: { slug, status: 'PUBLISHED' },
    include: [
      {
        model: LiveClass,
        as: 'liveClasses',
        include: [{ model: User, as: 'tutor' }],
      },
    ],
    order: [[{ model: LiveClass, as: 'liveClasses' }, 'startTime', 'ASC']],
  });

  if (!pkg) notFound();

  let isEnrolled = false;
  if (user) {
    const enroll = await Enrollment.findOne({ where: { userId: user.id, packageId: pkg.id } });
    isEnrolled = !!enroll;
  }

  const pkgJson = pkg.toJSON() as any;
  const liveClasses = pkgJson.liveClasses || [];
  let whatYoullLearn: string[] = [];
  if (Array.isArray(pkgJson.whatYoullLearn)) {
    whatYoullLearn = pkgJson.whatYoullLearn;
  } else if (typeof pkgJson.whatYoullLearn === 'string' && pkgJson.whatYoullLearn.trim().startsWith('[')) {
    try {
      whatYoullLearn = JSON.parse(pkgJson.whatYoullLearn);
    } catch(e) {}
  }
  whatYoullLearn = whatYoullLearn.filter(Boolean).filter(i => i.trim() !== '');
  const instructors: any[] = pkgJson.instructors || [];
  const successStories: any[] = pkgJson.successStories || [];
  const courseModules: { title: string; topics: string[] }[] = pkgJson.courseModules || [];
  
  // New Dynamic Sections
  const highlights: { title: string; description: string }[] = pkgJson.highlights || [];
  const skills: any[] = pkgJson.skills || [];
  const techStack: any[] = pkgJson.techStack || [];
  const projectDetails: { description: string; stages: { title: string; content: string }[] } | null = pkgJson.projectDetails || null;
  const targetAudience: { list: string[]; prerequisites: string } | null = pkgJson.targetAudience || null;
  const faqs: { question: string; answer: string }[] = pkgJson.faqs || [];
  const certificateData: any = pkgJson.certificateData || null;

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">

        {/* ─── DARK HERO BANNER ─── */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-28 pb-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <p className="text-sm text-white/40 font-medium mb-8">
              <a href="/packages" className="hover:text-white/70 transition-colors">All Courses</a>
              <span className="mx-2">›</span>
              <span className="text-white/60">{pkgJson.title}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left Column - Video/Thumbnail */}
              <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-slate-700/50 bg-slate-800 aspect-video flex items-center justify-center">
                {pkgJson.videoUrl ? (
                  <iframe 
                    src={(() => {
                      const url = pkgJson.videoUrl;
                      if (!url) return '';
                      if (url.includes('youtube.com/watch?v=')) {
                        try {
                          const videoId = new URL(url).searchParams.get('v');
                          return `https://www.youtube.com/embed/${videoId}`;
                        } catch { return url; }
                      }
                      if (url.includes('youtu.be/')) {
                        const videoId = url.split('youtu.be/')[1].split('?')[0];
                        return `https://www.youtube.com/embed/${videoId}`;
                      }
                      return url;
                    })()}
                    title={pkgJson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full absolute inset-0"
                  ></iframe>
                ) : pkgJson.thumbnail ? (
                  <img src={pkgJson.thumbnail} alt={pkgJson.title} className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <svg className="w-12 h-12 mb-3 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                    <span className="text-sm font-semibold">Course Preview</span>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="order-1 lg:order-2 space-y-6">
                
                {/* Title */}
                <h1 className="text-4xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  {pkgJson.title}
                </h1>
                
                {/* Stats / Rating Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  {pkgJson.rating && (
                    <div className="flex items-center text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      <span className="mr-1">★</span> {pkgJson.rating} <span className="text-amber-400/60 ml-1">({pkgJson.reviewsCount || '0'} Reviews)</span>
                    </div>
                  )}
                  {pkgJson.level && (
                    <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                      {pkgJson.level}
                    </div>
                  )}
                </div>

                {/* Description Snippet */}
                <p className="text-slate-300 text-base md:text-lg leading-relaxed line-clamp-3">
                  {pkgJson.description.replace(/<[^>]*>?/gm, '').substring(0, 180)}...
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Live Classes
                  </span>
                  {pkgJson.mode && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider shadow-inner">
                      {pkgJson.mode === 'ONLINE' ? '🌐 Online Training' : pkgJson.mode === 'OFFLINE' ? '🏫 Campus Training' : '🌐🏫 Online & Offline Training'}
                    </span>
                  )}
                  {pkgJson.category && pkgJson.category !== 'Uncategorized' && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider shadow-inner">
                      🏷️ {pkgJson.category}
                    </span>
                  )}
                </div>

                {/* Action Row */}
                <div className="pt-6 flex flex-wrap items-center gap-6 border-t border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Course Fee</span>
                    <span className="text-3xl font-black text-white">
                      {pkgJson.price && Number(pkgJson.price) > 0 ? `₹${Number(pkgJson.price).toLocaleString('en-IN')}` : 'Free'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-[200px]">
                    <PackageEnrollWidget pkg={pkgJson} user={user ? (user as any).toJSON() : null} isEnrolled={isEnrolled} variant="button" />
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT + SIDEBAR ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

            {/* ── LEFT COLUMN – Main content ── */}
            <div className="w-full lg:flex-1 space-y-14 min-w-0">

              {/* Description */}
              <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 rounded-full bg-gradient-to-b from-orange-500 to-rose-500"></span>
                  About This Course
                </h2>
                <div
                  className="prose prose-slate max-w-none prose-headings:font-black prose-h2:text-2xl prose-a:text-orange-600 prose-li:marker:text-orange-500"
                  dangerouslySetInnerHTML={{ __html: pkgJson.description || '' }}
                />
              </section>

              {/* Highlights (Main Content) */}
              {highlights.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl font-black text-slate-900">Course Highlights</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highlights.map((item, i) => (
                      <div key={i} className="flex gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-50 to-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block mb-1">{item.title}</span>
                          <span className="text-sm text-slate-600 leading-relaxed">{item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}



              {/* Skills & Tech Stack */}
              {(skills.length > 0 || techStack.length > 0) && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {skills.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500 flex-shrink-0" />
                        <h2 className="text-2xl font-black text-slate-900">Skills You'll Gain</h2>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {skills.map((skill, i) => {
                          const skillName = typeof skill === 'string' ? skill : skill.name;
                          const skillIcon = typeof skill === 'string' ? null : (skill.iconUrl || null);
                          const skillEmoji = typeof skill === 'string' ? null : (skill.emoji || null);
                            const skillLink = typeof skill === 'string' ? null : (skill.link || null);
                            const ItemWrapper = skillLink ? 'a' : 'div';
                            const itemProps = skillLink ? { href: skillLink, target: '_blank', rel: 'noopener noreferrer' } : {};
                            
                            return (
                              <ItemWrapper 
                                key={i} 
                                {...itemProps}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default"
                                style={skillLink ? { cursor: 'pointer' } : {}}
                              >
                                {skillIcon ? (
                                  <img src={skillIcon} alt={skillName} className="w-5 h-5 object-contain flex-shrink-0" />
                                ) : skillEmoji ? (
                                  <span className="text-base leading-none flex-shrink-0">{skillEmoji}</span>
                                ) : null}
                                <span>{skillName}</span>
                                {skillLink && (
                                  <svg className="w-3 h-3 text-slate-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                )}
                              </ItemWrapper>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {techStack.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-500 to-yellow-500 flex-shrink-0" />
                        <h2 className="text-2xl font-black text-slate-900">Tech Stack</h2>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {techStack.map((tech, i) => {
                          const techName = typeof tech === 'string' ? tech : tech.name;
                          const techIcon = typeof tech === 'string' ? null : tech.iconUrl;
                          return (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                              {techIcon && <img src={techIcon} alt={techName} className="w-5 h-5 object-contain" />}
                              <span>{techName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* What You'll Learn */}
              {whatYoullLearn.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">What You'll Learn</h2>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {whatYoullLearn.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-slate-700 font-medium text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

            </div>



          </div>
        </div>

        {/* ─── FULL WIDTH SECTIONS (Bottom Section) ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-24 space-y-16 lg:space-y-24">
          
          {/* Project Details */}
          {projectDetails && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-blue-500 flex-shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Your Project</h2>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-7">
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
                  {projectDetails.description}
                </p>
                <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-blue-50/50 text-blue-800 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-blue-100">Stage</th>
                        <th className="px-6 py-4 border-b border-blue-100">What you add to your project</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50/50">
                      {projectDetails.stages.map((stage, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 font-bold text-slate-900">{stage.title}</td>
                          <td className="px-6 py-4">{stage.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

              {/* Course Content */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Course Content</h2>
                  </div>
                  <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                    {courseModules.length > 0
                      ? `${courseModules.length} modules · ${courseModules.reduce((a, m) => a + m.topics.length, 0)} lessons`
                      : `${liveClasses.length} Sessions`}
                  </span>
                </div>

                {courseModules.length > 0 ? (
                  <CourseModuleAccordion modules={courseModules} />
                ) : liveClasses.length === 0 ? (
                  <div className="p-12 bg-slate-50 border border-slate-200 border-dashed rounded-3xl text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Schedule Coming Soon</h3>
                    <p className="text-slate-500 text-sm">Live class schedule is being finalised. Please check back soon.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {liveClasses.map((lc: any, idx: number) => (
                      <div key={lc.id} className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-orange-200 hover:shadow-md transition-all duration-300">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-black text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{lc.title}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {new Date(lc.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {lc.duration} mins
                            {lc.tutor?.name && <span> · <span className="text-orange-600">{lc.tutor.name}</span></span>}
                          </p>
                        </div>
                        <span className="flex-shrink-0 px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 uppercase tracking-wide">Live</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Our Instructors */}
              {instructors.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Our Instructors</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {instructors.map((instructor: any, i: number) => (
                      <div key={i} className="flex items-start gap-5 p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all duration-300">
                        {instructor.avatar ? (
                          <img src={instructor.avatar} alt={instructor.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-slate-100" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center flex-shrink-0 text-2xl font-black text-orange-600 border-2 border-orange-100">
                            {instructor.name?.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900">{instructor.name}</h4>
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">{instructor.role}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{instructor.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Success Stories */}
              {successStories.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Our Success Stories</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {successStories.map((story: any, i: number) => (
                      <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all duration-300">
                        <div className="flex gap-1 text-orange-400 mb-4">
                          {[...Array(5)].map((_, si) => (
                            <svg key={si} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium mb-5">"{story.quote}"</p>
                        <div className="flex items-center gap-3">
                          {story.avatar ? (
                            <img src={story.avatar} alt={story.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500">
                              {story.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-black text-slate-900 text-sm">{story.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{story.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Target Audience */}
              {targetAudience && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Who Can Join</h2>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-7 space-y-6">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {targetAudience.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-slate-700 font-medium text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                    {targetAudience.prerequisites && (
                      <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                        <span className="font-bold text-orange-800 text-sm block mb-1">Prerequisites:</span>
                        <span className="text-orange-700 text-sm font-medium">{targetAudience.prerequisites}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Certificate Section */}
              {certificateData && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Certification</h2>
                  </div>
                  <CertificateToggle data={certificateData} />
                </section>
              )}

              {/* FAQs */}
              {faqs.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500 flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
                  </div>
                  <FaqAccordion faqs={faqs} />
                </section>
              )}

        </div>

      </main>
      <Footer />
    </>
  );
}
