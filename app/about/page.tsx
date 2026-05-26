import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata = {
  title: 'About Us | Flymedia Technology Summer Training',
  description: 'Learn about Flymedia Technology, our 14+ years of industry excellence in digital marketing, web designing, and our 30-day summer bootcamps.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Title */}
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Our Legacy</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              14+ Years of Industry Excellence
            </h1>
            <p className="text-lg text-slate-650 max-w-2xl mx-auto">
              Flymedia Technology is a leading IT development and digital marketing agency delivering results globally since 2012.
            </p>
          </div>

          {/* Graphic Element */}
          <div className="h-64 sm:h-96 rounded-3xl overflow-hidden relative shadow-md">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
              alt="Flymedia Technology team collaboration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white text-lg font-bold">
              30 Days Summer Bootcamp 2026
            </div>
          </div>

          {/* Vision/Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Practical Approach</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                We believe standard software courses are too passive. At Flymedia Technology, our summer training bootcamp is structured around daily 2-hour sessions containing live project training. Students work on actual client campaigns and production server projects.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Global Exposure</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                With office footprints spanning India, Australia, and Canada, we offer students insights into cross-border agency strategies, digital market optimization, and modern web application development.
              </p>
            </div>
          </div>

          {/* Expert Mentor */}
          <div className="p-8 rounded-3xl bg-orange-50 border border-orange-200/50 space-y-4">
            <h3 className="text-lg font-bold text-orange-950 flex items-center gap-2">
              <span>⭐</span> Lead Trainer: Anuj Gupta
            </h3>
            <p className="text-xs text-orange-900 leading-relaxed">
              Our modules are spearheaded by **Anuj Gupta**, Google AdWords Certified digital marketing expert. Learn search engine marketing (SEM), search engine optimization (SEO), payment gateway integrations, and robust web architectures from an active practitioner who works with hundreds of international businesses.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
