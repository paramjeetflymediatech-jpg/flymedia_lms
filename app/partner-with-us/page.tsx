import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import PartnerForm from '../../src/components/partner/PartnerForm';
import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';


export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/partner-with-us', {
    title: 'Partner With Us | College Tie-Ups & 100% Free Education for Trusts | Flymedia',
    description:
      'Partner your College or University with Flymedia for student training benefits, or register your Charitable Trust/NGO to provide 100% free tech education to underprivileged students.',
  });
}

export default function PartnerWithUsPage() {
  return (
    <>
      <PageSeoScripts path="/partner-with-us" />
      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-32 pb-24 lg:pt-36 lg:pb-32 bg-slate-950 text-white overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-rose-600/15 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
                🏛️ College Campus Tie-Ups
              </span>
              <span className="text-slate-500">•</span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🌱 100% Free Education for Charity Trusts
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
              Bridging Higher Education &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                Social Empowerment
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
              We empower institutions through specialized student benefits and provide completely free,
              world-class technical education to underprivileged students studying with community trusts and NGOs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#partner-form-section"
                className="px-8 py-4 rounded-full font-extrabold text-sm text-white shadow-xl hover:shadow-orange-500/25 transition-all transform hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              >
                Join as a Partner Today &rarr;
              </a>
              <a
                href="#initiatives"
                className="px-8 py-4 rounded-full font-bold text-sm text-slate-300 bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm"
              >
                Explore Partner Benefits
              </a>
            </div>

            {/* Impact Highlights Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-800/80">
              <div>
                <div className="text-3xl lg:text-4xl font-black text-white">45+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Colleges &amp; Institutes</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-black text-emerald-400">100% Free</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">For Registered Trusts</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-black text-white">10,000+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Students Trained</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-black text-rose-400">ISO 9001:2015</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Certified Academy</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DUAL PILLARS SECTION ================= */}
        <section id="initiatives" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
              Collaborative Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Two Ways to Partner with Flymedia
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              Whether you are an academic institution seeking premium industrial exposure for your students,
              or a social trust working tirelessly for underprivileged youth, we have dedicated programs for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Pillar 1: College Tie-Ups */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-blue-500/5 hover:border-blue-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 mb-3">
                  For Colleges &amp; Universities
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                  Campus Connect &amp; Student Benefits
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Help your college students bridge the gap between academic theory and high-paying tech careers.
                  Partner with us to offer subsidized training, industrial projects, and guaranteed interview opportunities.
                </p>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Subsidized &amp; Institutional Discounted Batches:</strong>
                      <span className="text-xs text-slate-500">Your college students unlock subsidized tuition on 6-month &amp; 6-week training tracks.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">ISO Recognized Certificates &amp; Minor/Major Projects:</strong>
                      <span className="text-xs text-slate-500">Curriculum-aligned practical assignments, real GitHub portfolios, and verified certificates.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Campus Placement Drives &amp; Hackathons:</strong>
                      <span className="text-xs text-slate-500">Direct hiring pipelines with top IT firms in Ludhiana, Chandigarh Tricity, and NCR.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Dedicated Institutional Coordinator:</strong>
                      <span className="text-xs text-slate-500">Seamless coordination with your college TPO/HOD with student attendance and progress logs.</span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="#partner-form-section"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all border border-blue-200 hover:border-blue-600"
              >
                Apply for College MoU &amp; Benefits &rarr;
              </a>
            </div>

            {/* Pillar 2: Community Trusts & Charities */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-emerald-500/5 hover:border-emerald-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">
                  🌱
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-3">
                  For Charities, Trusts &amp; NGOs
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                  100% Free Education for Underprivileged Students
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Education is the ultimate equalizer. If your charitable trust or NGO supports students who cannot afford
                  technical coaching, we provide 100% free courses, mentors, and certificates to empower their lives.
                </p>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Zero Tuition Fee (100% Sponsored by Flymedia):</strong>
                      <span className="text-xs text-slate-500">No hidden costs, registration charges, or exam fees for verified trust students.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Career-Oriented In-Demand Tech Skills:</strong>
                      <span className="text-xs text-slate-500">Web development, python, basic computer literacy, graphic design, and digital marketing.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Free Course Completion &amp; Skill Badges:</strong>
                      <span className="text-xs text-slate-500">Students earn authentic credentials that boost their chances in initial job interviews.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Flexible Learning (Offline Labs &amp; Live Online):</strong>
                      <span className="text-xs text-slate-500">Access to our Ludhiana training campus facilities or live interactive classes from home/centers.</span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="#partner-form-section"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200 hover:border-emerald-600"
              >
                Register Your Trust for Free Education &rarr;
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

          <PartnerForm />
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Got Questions?</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  How do students from partnered colleges avail their training discounts and benefits?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Once your college signs an official partnership with Flymedia Technology, we issue an exclusive Institutional Code (e.g., GNDEC-FLY2026). Your students simply enter this code during enrollment or register via our dedicated college landing page to immediately avail subsidized pricing, dedicated batch slots, and priority lab allocations.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  How does Flymedia verify charitable trusts and sponsor 100% free education?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We verify the registration of the trust, NGO, or charitable society. Once approved, the authorized trustee or center head shares the list of enrolled students. Flymedia grants full scholarship accounts with zero tuition fees, giving these deserving students access to live mentor sessions, study materials, and certificates at zero cost.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Can we organize on-campus seminars or faculty development workshops?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Yes! Our senior industry trainers regularly visit affiliated college campuses across Punjab and North India to conduct live technology workshops, AI masterclasses, career orientation sessions, and faculty enablement programs.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Where are the live training sessions conducted?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Students can either attend hands-on practical sessions at our state-of-the-art Ludhiana campus (Vishal Nagar Ext, opposite Kashish Cafe), or join our interactive live online batches with 1-on-1 mentor guidance.
                </p>
              </div>
            </div>

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
      </main>

      <Footer />
    </>
  );
}
