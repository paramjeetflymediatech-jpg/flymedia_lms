import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import PartnerForm from '../../src/components/partner/PartnerForm';
import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';
import { Faq } from '../../src/db/models';
import FaqAccordion from '../../src/components/home/FaqAccordion';
import FaqSchema from '../../src/components/seo/FaqSchema';
import { Op } from 'sequelize';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/partner-with-us', {
    title: 'Connects Higher Education & Advanced Learning Tools To Empower Students | Partner With Us | Flymedia',
    description:
      'Partner with Flymedia: Campus Connect Programs with real projects, affordable training & guaranteed interviews for colleges, plus 100% free tech education for underprivileged students through community trusts.',
  });
}

export default async function PartnerWithUsPage(props: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const rawType = (searchParams?.type || '').toLowerCase();
  const initialType: 'COLLEGE' | 'CHARITY' =
    rawType === 'charity' || rawType === 'trust' || rawType === 'nonprofit' || rawType === 'ngo'
      ? 'CHARITY'
      : 'COLLEGE';

  let partnerFaqs: any[] = [];
  try {
    const records = await Faq.findAll({
      where: {
        page: { [Op.in]: ['PARTNER', 'GLOBAL'] },
        isActive: true,
      },
      order: [['order', 'ASC'], ['createdAt', 'ASC']],
    });
    partnerFaqs = records.map(f => f.toJSON());
  } catch (err) {
    console.error('Failed to load partner FAQs:', err);
  }

  const faqsToDisplay = partnerFaqs;

  return (
    <>
      <PageSeoScripts path="/partner-with-us" />
      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* ================= HERO SECTION (H1) ================= */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-24 bg-slate-950 text-white overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-rose-600/15 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
              <a
                href="/partner-with-us?type=college#partner-form-section"
                className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all cursor-pointer"
              >
                🏛️ Campus Connect Programs
              </a>
              <span className="text-slate-500">•</span>
              <a
                href="/partner-with-us?type=charity#partner-form-section"
                className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
              >
                🌱 Totally Free Education for Underprivileged Students
              </a>
            </div>

            {/* Main H1 Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.15] max-w-5xl mx-auto mb-6 text-white">
              Connects Higher Education and{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                Advanced Learning Tools
              </span>{' '}
              To Empower Students
            </h1>

            {/* H1 Sub-paragraph */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal max-w-4xl mx-auto mb-10 leading-relaxed">
              However, schools and colleges are important for higher education, but they don&apos;t teach us the useful skills that are necessary to secure our future. Many families are living from paycheck to paycheck, and they don&apos;t have funds to provide big degrees for their children. Hence, there is a big gap between academic education and skill development, but Flymedia Tech Company is trying to fill this gap by making skills education available to underprivileged students who study with community trusts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#partner-form-section"
                className="px-8 py-4 rounded-full font-extrabold text-sm text-white shadow-xl hover:shadow-orange-500/25 transition-all transform hover:-translate-y-1 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              >
                Join as a Partner Today &rarr;
              </a>
              <a
                href="#initiatives"
                className="px-8 py-4 rounded-full font-bold text-sm text-slate-300 bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm cursor-pointer"
              >
                Explore Collaboration Opportunities
              </a>
            </div>

            {/* Impact Highlights Bar */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-800/80">
              <div>
                <div className="text-3xl lg:text-4xl font-black text-white">45+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Colleges &amp; Institutes</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-black text-emerald-400">100% Free</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">For Non-Profit Orgs</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-black text-white">10,000+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Students Trained</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EQUALITY & ECONOMIC EMPOWERMENT MISSION (H2) ================= */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-5">
              <span>🌍</span> Global Goal &amp; Social Justice
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              Eliminating inequality has become crucial for the global goal to overcome economic disparities. With higher education, skill development courses become crucial instruments that can help students and societies free themselves from economic injustice and create opportunities to secure their future.
            </h2>
          </div>
        </section>

        {/* ================= COLLABORATION OPPORTUNITIES (H3, H4, H5) ================= */}
        <section id="initiatives" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* H3 Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
              Partnership Pathways
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Collaboration Opportunities
            </h3>
            <p className="text-slate-700 text-base sm:text-lg font-medium mt-3">
              You can partner with Flymedia in two ways:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-sm text-slate-700">
                <strong className="text-blue-900 block font-bold mb-1">🏛️ For Academic Institutions:</strong>
                If you are running an academic institution, we can help your students seeking premium industrial exposure to build their careers in the industrial world.
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-sm text-slate-700">
                <strong className="text-emerald-900 block font-bold mb-1">🌱 For Social Trusts &amp; NGOs:</strong>
                If you work tirelessly for underprivileged students through a social trust, in this case, we work with you to support you by providing a dedicated program for you.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Pillar 1: Campus Connect Programs (H4) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-blue-500/5 hover:border-blue-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 mb-3">
                  For Colleges &amp; Universities
                </span>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                  Campus Connect Programs
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  We are here to help your students bridge the gap between academic study and high-tech careers, as you can partner with us to provide your students:
                </p>

                {/* Key Benefits List */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>Platform work on real-world projects</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>Affordable training programs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>Guaranteed interview opportunities with top companies</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Benefit 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Subsidized and Institutionally Discounted Batches:</strong>
                      <span className="text-xs text-slate-600">
                        We offer training programs in which your students can get discounts for both six-month training and six-week training programs with the help of university partnership or financial subsidies.
                      </span>
                    </div>
                  </div>

                  {/* Benefit 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">ISO Recognised Certificates And Minor Or Major Projects:</strong>
                      <span className="text-xs text-slate-600">
                        After completion of the training program, we provide practical assignments and verified ISO certificates to the students, and this helps ensure that the provided training is professional and compliant with global benchmarks.
                      </span>
                    </div>
                  </div>

                  {/* Benefit 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Campus Placement Drives:</strong>
                      <span className="text-xs text-slate-600">
                        We offer campus placement programs with top IT companies in Ludhiana and Chandigarh.
                      </span>
                    </div>
                  </div>

                  {/* Benefit 4 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Dedicated Institutional Coordinators:</strong>
                      <span className="text-xs text-slate-600">
                        We stay in touch with your training and placement officer to keep a daily record of class attendance and pass information and share it directly with your college, so your professor always knows how well you are performing.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="/partner-with-us?type=college#partner-form-section"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all border border-blue-200 hover:border-blue-600 shadow-sm"
              >
                Apply for Campus Connect Program &rarr;
              </a>
            </div>

            {/* Pillar 2: Totally Free Education For Underprivileged Students (H5) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-emerald-500/5 hover:border-emerald-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
                  🌱
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-3">
                  For Non-Profit Organizations &amp; Trusts
                </span>
                <h5 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                  Totally Free Education For Underprivileged Students
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Flymedia Tech Company is on a dedicated mission to eliminate inequality and bridge the gap between academic education and modern technical skill development.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">Zero tuition fee:</strong>
                      <span className="text-xs text-slate-600">100% sponsored tech education with zero costs for verified trust students.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">Career-oriented skills provided:</strong>
                      <span className="text-xs text-slate-600">Full stack web development, digital marketing, graphic design, and python coding.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">Free course completion and skill badges:</strong>
                      <span className="text-xs text-slate-600">Industry-recognized ISO credentials that validate student talent and build career confidence.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">Flexible learning through online and offline:</strong>
                      <span className="text-xs text-slate-600">Access to interactive smart classrooms at our Ludhiana campus or online virtual learning hubs.</span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="/partner-with-us?type=charity#partner-form-section"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200 hover:border-emerald-600 shadow-sm"
              >
                Register Your Non-Profit Org for Free Education &rarr;
              </a>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE APPLICATION FORM ================= */}
        <section className="py-12 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Partnership Application Portal
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Submit Your Partnership Request
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select your institution type below and complete the form. Our leadership team responds within 24 hours.
            </p>
          </div>

          <PartnerForm defaultType={initialType} />
        </section>

        {/* ================= FAQ SECTION ================= */}
        {faqsToDisplay.length > 0 && (
          <section className="py-16 bg-white border-t border-slate-200">
            <FaqSchema faqs={faqsToDisplay} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Got Questions?</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Frequently Asked Questions</h2>
              </div>

              <FaqAccordion faqs={faqsToDisplay} />

              {/* Helpline Banner */}
              <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="text-xl font-black">Need immediate institutional guidance?</h3>
                  <p className="text-xs text-slate-300 mt-1">Speak directly with our Director of Academic &amp; Social Partnerships.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="tel:+919779324178"
                    className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 font-extrabold text-xs text-white transition-all shadow-md"
                  >
                    📞 +91-97793-24178
                  </a>
                  <a
                    href="mailto:learnwithflymedia@gmail.com"
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs text-white transition-all border border-white/20"
                  >
                    ✉️ Email Desk
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
