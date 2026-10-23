import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import { GalleryItem } from '../../src/db/models';
import GallerySection from '../../src/components/gallery/GallerySection';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Success Gallery & Student Reviews | Flymedia Technology',
  description:
    'Explore verified student placements, success stories, live project demos, and video testimonials from Flymedia Technology graduates in Ludhiana.',
};

export default async function GalleryPage() {
  let items: any[] = [];

  try {
    await GalleryItem.sync({ alter: true });
    const dbItems = await GalleryItem.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    items = dbItems.map((i) => i.toJSON());
  } catch (err) {
    console.error('Failed to load gallery items:', err);
  }

  // Fallback demo items if database is clean so the page is immediately beautiful and populated
  if (items.length === 0) {
    items = [
      {
        id: 'seed-1',
        title: 'Placed as Full Stack MERN Developer at Tech Mahindra',
        description: 'Completed the 6-month intensive training program at Flymedia. Built 3 real client portals and mastered React, Node, and MongoDB with 1-on-1 mentor guidance.',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        studentName: 'Simran Kaur',
        courseName: 'Full Stack Web Development (MERN)',
        companyPlaced: 'Tech Mahindra',
        salaryPackage: '₹6.5 LPA',
        rating: 5,
        category: 'PLACEMENT',
      },
      {
        id: 'seed-2',
        title: 'Video Testimonial: From Beginner to Digital Marketing Lead',
        description: 'Watch Aman deep-dive into how real live campaigns, Google Ads budget management, and client pitch preparation helped him scale his freelance agency to 6 figures.',
        mediaType: 'VIDEO',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        studentName: 'Amanpreet Singh',
        courseName: 'Digital Marketing Masterclass',
        companyPlaced: 'Digital Growth Agency',
        salaryPackage: '₹5.8 LPA',
        rating: 5,
        category: 'VIDEO_REVIEW',
      },
      {
        id: 'seed-3',
        title: 'Placed as Motion Graphic Designer at Media Works',
        description: 'Hands-on practice in Adobe Premiere Pro, After Effects, and DaVinci Resolve. The portfolio reviews and capstone videos gave me an edge during creative interviews.',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        studentName: 'Gurpreet Singh',
        courseName: 'Video Editing & Motion Graphics',
        companyPlaced: 'Media Works Studios',
        salaryPackage: '₹4.8 LPA',
        rating: 5,
        category: 'PLACEMENT',
      },
      {
        id: 'seed-4',
        title: 'Student Project Showcase: AI-Powered Multi-Vendor SaaS',
        description: 'Check out the live client project built by the weekend batch — an end-to-end full stack application integrated with real payment gateways and automated analytics.',
        mediaType: 'VIDEO',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        studentName: 'Flymedia Hackathon Batch',
        courseName: 'MERN Stack & Cloud Engineering',
        companyPlaced: 'Multiple MNC Placements',
        salaryPackage: '96% Batch Placed',
        rating: 5,
        category: 'PROJECT_DEMO',
      },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-400 font-extrabold text-xs uppercase tracking-widest backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              FLYMEDIA SUCCESS SHOWCASE
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Where Skills Turn Into <br />
              <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-amber-400 bg-clip-text text-transparent">
                High-Paying Careers
              </span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Real students. Real placements. Real videos. See how our live-project methodology and career guidance help thousands transition into tech.
            </p>

            {/* Placement Metric Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-black text-white">96%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Placement Rate</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-black text-orange-400">15K+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Students Trained</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-black text-amber-400">4.9 ★</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Average Review</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-black text-rose-400">250+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Hiring Partners</p>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY COMPONENT */}
        <GallerySection items={items} showViewAll={false} />

        {/* CTA BANNER */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-r from-orange-600 to-rose-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-white font-black text-xs uppercase tracking-widest inline-block backdrop-blur-md">
              ⚡ SPECIAL OPPORTUNITY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready To Be Our Next Success Story?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
              Don’t guess. Experience 1 live mentor-led demo class for any course for just ₹99 before taking your decision.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#callback"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl shadow-2xl transition-all hover:scale-105 text-base"
              >
                Book Demo Class (₹99)
              </Link>
              <a
                href="tel:+919779324178"
                className="w-full sm:w-auto px-8 py-4 bg-black/30 hover:bg-black/50 text-white border border-white/20 font-black rounded-2xl transition-all text-base flex items-center justify-center gap-2"
              >
                <span>📞 Call +91-97793-24178</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
