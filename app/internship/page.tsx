import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';
import InternshipForm from '../../src/components/internship/InternshipForm';
import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';
import { Faq } from '../../src/db/models';
import FaqAccordion from '../../src/components/home/FaqAccordion';
import FaqSchema from '../../src/components/seo/FaqSchema';
import { Op } from 'sequelize';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/internship', {
    title: 'Industrial Training & Internship Program (6 Weeks / 6 Months) | Flymedia Technology',
    description:
      'Apply for Flymedia Summer & Industrial Internship in Ludhiana & Online. Work on live client projects in Web Development, Python & AI, Digital Marketing, Graphic Design & Video Editing. MSME certified letter & 100% placement support.',
  });
}

const INTERNSHIP_DOMAINS_DATA = [
  {
    title: 'Full Stack Web Development (MERN & Next.js)',
    icon: '💻',
    tag: 'Highest Placement Demand',
    skills: ['React.js', 'Next.js', 'Node.js', 'Express', 'MongoDB / MySQL', 'Tailwind CSS', 'Git & GitHub'],
    duration: '45 Days / 6 Weeks / 6 Months',
    description:
      'Build end-to-end web apps, SaaS dashboards, and real-time APIs. Learn scalable architecture, auth, database design, and cloud deployments.',
  },
  {
    title: 'Python, AI & Data Science',
    icon: '🤖',
    tag: 'Trending Technology',
    skills: ['Core & Advanced Python', 'NumPy & Pandas', 'Machine Learning', 'FastAPI / Django', 'Data Analytics', 'Model Deployment'],
    duration: '45 Days / 6 Weeks / 6 Months',
    description:
      'Master data processing, predictive modeling, machine learning algorithms, and intelligent automation using industry-standard Python libraries.',
  },
  {
    title: 'Digital Marketing & Performance SEO',
    icon: '📈',
    tag: 'High Growth Career',
    skills: ['Technical SEO', 'Google Search Ads', 'Meta Facebook / Insta Ads', 'Google Analytics 4', 'Lead Funnels', 'Content Marketing'],
    duration: '45 Days / 6 Weeks / 3 Months',
    description:
      'Manage live ad budgets, optimize real websites to rank #1 on Google, and master data-driven conversion strategies for client businesses.',
  },
  {
    title: 'Graphic Design & UI/UX Product Design',
    icon: '🎨',
    tag: 'Creative & High Demand',
    skills: ['Figma Prototyping', 'Adobe Photoshop', 'Adobe Illustrator', 'Design Systems', 'Mobile App UX', 'Brand Identity'],
    duration: '45 Days / 6 Weeks / 6 Months',
    description:
      'Design modern user experiences, mobile apps, SaaS dashboards, and corporate branding assets with clean aesthetics and user research.',
  },
  {
    title: 'Video Editing, Motion Graphics & VFX',
    icon: '🎬',
    tag: 'Creator Economy Boom',
    skills: ['Adobe Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design', 'YouTube Formats', 'Shorts & Reels Editing'],
    duration: '45 Days / 6 Weeks / 3 Months',
    description:
      'Learn cinematic storytelling, kinetic typography, motion graphics, audio mastering, and commercial video post-production.',
  },
  {
    title: 'Mobile App Development (Flutter & React Native)',
    icon: '📱',
    tag: 'Cross-Platform Pro',
    skills: ['Flutter & Dart', 'React Native', 'Firebase Backend', 'State Management', 'REST APIs', 'Play Store Deployment'],
    duration: '6 Weeks / 6 Months',
    description:
      'Develop slick cross-platform iOS and Android apps with reactive state management, hardware integrations, and production publishing.',
  },
];

const DEFAULT_INTERNSHIP_FAQS = [
  {
    id: 'int-faq-1',
    question: 'Who is eligible to apply for the Flymedia Internship Program?',
    answer:
      'Students pursuing B.Tech / B.E (any branch, especially CSE / IT / ECE), BCA, MCA, Diploma / Polytechnic, B.Sc / M.Sc Computer Science, as well as recent graduates looking to gain live hands-on industry project experience are eligible.',
  },
  {
    id: 'int-faq-2',
    question: 'Will I get an official College NOC and Experience Certificate?',
    answer:
      'Yes, absolutely. We provide official Acceptance Letters, College NOC documentation, Weekly Progress Reports,  recognized Project Completion and Experience Certificate upon successful completion.',
  },
  {
    id: 'int-faq-3',
    question: 'What are the available modes of training?',
    answer:
      'We offer Campus Training at our modern lab facility in Ludhiana, Punjab, 100% Live Mentor-Led Online Training for distant students, as well as a Hybrid mode (flexible mix of campus lab and online sessions).',
  },
  {
    id: 'int-faq-4',
    question: 'What is the duration of the internship?',
    answer:
      'We offer 45 Days / 6 Weeks Summer Training, 3 Months Project Training, and 6 Months Semester Industrial Training. Batches are organized according to university academic calendars.',
  },
  {
    id: 'int-faq-5',
    question: 'Is placement assistance provided after the internship?',
    answer:
      'Yes! We conduct mock technical interviews, resume building sessions, GitHub / portfolio reviews, and connect deserving students with our 50+ hiring partner companies across Ludhiana, Chandigarh Tricity, Delhi-NCR, and remote opportunities.',
  },
];

export default async function InternshipPage() {
  let dbFaqs: any[] = [];
  try {
    const records = await Faq.findAll({
      where: {
        page: { [Op.in]: ['INTERNSHIP', 'GLOBAL'] },
        isActive: true,
      },
      order: [['order', 'ASC'], ['createdAt', 'ASC']],
    });
    dbFaqs = records.map((f) => f.toJSON());
  } catch (err) {
    console.error('Failed to load internship FAQs:', err);
  }

  const faqsToDisplay = dbFaqs.length > 0 ? dbFaqs : DEFAULT_INTERNSHIP_FAQS;

  return (
    <>
      <PageSeoScripts path="/internship" />
      <FaqSchema faqs={faqsToDisplay} />
      <Header />

      <main className="min-h-screen bg-slate-50 text-slate-800">
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-slate-950 text-white overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-rose-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-orange-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Top Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border border-rose-500/30 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>Summer &amp; 6 Months Industrial Internship 2025 - 2026</span>
              </span>
             
            </div>

            {/* H1 Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-5xl mx-auto mb-6 text-white">
              Launch Your Tech Career With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300">
                Live Client Project Training
              </span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal max-w-3xl mx-auto mb-10 leading-relaxed">
              Don&apos;t settle for dummy theory courses. Join Flymedia Technology&apos;s intensive 6 Weeks / 6 Months Industrial Training program. Build live web, mobile, AI &amp; marketing products under 1-on-1 industry mentors.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/internship-form"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                className="px-8 py-4 rounded-full font-black text-sm text-white shadow-xl hover:shadow-orange-500/25 transition-all transform hover:-translate-y-1 cursor-pointer flex items-center gap-2"
              >
                <span>Apply for Internship Now</span>
                <span className="text-white">&rarr;</span>
              </Link>

              <a
                href="tel:+919779324178"
                className="px-8 py-4 rounded-full font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <span>📞 Call Helpline +91-97793-24178</span>
              </a>
            </div>

            {/* Stats Counter Ribbon */}
            <div className="mt-14 pt-10 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white">1500+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Students Trained</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-rose-400">50+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Live Client Projects</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-orange-400">100%</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Practical Code &amp; Lab</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">₹6.5 LPA</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Highest Placement</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5 PILLARS / WHY CHOOSE US ================= */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 mb-3 inline-block">
              Why Flymedia Technology?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Built For Serious Students Who Want Placements
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Everything you need to bridge the gap between college textbooks and modern tech company requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-black">
                🚀
              </div>
              <h3 className="text-lg font-black text-slate-900">Live Client Deployments</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Work on real-world projects that get shipped to production. Build portfolio apps you can confidently showcase in technical job interviews.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl font-black">
                👨‍💻
              </div>
              <h3 className="text-lg font-black text-slate-900">1-on-1 Mentor Guidance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No 100-student crowded lectures. Get dedicated code reviews, architecture discussions, and daily standups from senior full-stack developers.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black">
                📜
              </div>
              <h3 className="text-lg font-black text-slate-900">College NOC &amp; MSME Certificate</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive official college training acceptance letters, complete project reports, and ISO &amp; Government MSME registered experience credentials.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black">
                💼
              </div>
              <h3 className="text-lg font-black text-slate-900">Interview &amp; Resume Polishing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Conduct mock coding interviews, optimize your LinkedIn and GitHub profiles, and practice live algorithmic &amp; system design questions.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-black">
                🏫
              </div>
              <h3 className="text-lg font-black text-slate-900">Modern Ludhiana Campus Lab</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                High-speed dual broadband, ergonomic workstations, and developer-friendly collaborative space located at Vishal Nagar Extension, Ludhiana.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black">
                🌐
              </div>
              <h3 className="text-lg font-black text-slate-900">Interactive Online &amp; Hybrid</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Not located in Ludhiana? Join our live interactive Google Meet sessions with screen sharing, cloud labs, and instant mentor screen takeovers.
              </p>
            </div>
          </div>
        </section>

        {/* ================= DOMAINS SECTION ================= */}
        <section className="py-16 bg-slate-100/60 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 mb-3 inline-block">
                Choose Your Specialization
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Internship Training Tracks
              </h2>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Curated by senior developers to match currently hiring tech stacks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INTERNSHIP_DOMAINS_DATA.map((d, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-300 transition-all hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{d.icon}</span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {d.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      {d.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {d.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                        Technologies Mastered:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {d.skills.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      ⏱️ {d.duration}
                    </span>
                    <a
                      href="#apply-form"
                      className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
                    >
                      <span>Apply Now</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS (STEP BY STEP) ================= */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-3 inline-block">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How Admission &amp; Onboarding Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Submit Application</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fill the online internship form with your college, degree, and preferred technical domain.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Mentor Screening</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our counselor will connect via WhatsApp/Call to understand your career goal &amp; schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Acceptance &amp; NOC</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive your official Internship Joining Letter to submit to your college Training &amp; Placement cell.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 text-center space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Build Live Projects</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Start working on live client software with 1-on-1 mentor guidance and placement interview prep.
              </p>
            </div>
          </div>
        </section>

        {/* ================= THE APPLICATION FORM SECTION ================= */}
        <section id="apply-form" className="py-20 bg-slate-900 text-white relative overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-3 inline-block">
                ⚡ Limited Batch Seats
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Submit Your Internship Application
              </h2>
              <p className="text-slate-300 mt-2 text-sm sm:text-base">
                Join our 2025 - 2026 batches. Fill out your details below and our training coordinator will reach out within 24 hours.
              </p>
            </div>

            <InternshipForm variant="page" />
          </div>
        </section>

        {/* ================= FAQS SECTION ================= */}
        <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 mb-2 inline-block">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <FaqAccordion faqs={faqsToDisplay} />
        </section>
      </main>

      <Footer />
    </>
  );
}

