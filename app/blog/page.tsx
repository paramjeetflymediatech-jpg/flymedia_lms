import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Tech Blog | Flymedia Technology',
  description: 'Latest insights, tutorials, and industry news from Flymedia Technology.',
};

const blogPosts = [
  {
    id: 1,
    title: 'Top 10 SEO Strategies to Dominate Search Rankings in 2024',
    category: 'SEO',
    excerpt: 'Discover the latest algorithm updates and learn how to optimize your digital presence for maximum organic visibility.',
    date: 'Oct 24, 2023',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Mastering the MERN Stack: A Comprehensive Guide',
    category: 'Development',
    excerpt: 'Step-by-step breakdown of building scalable, full-stack applications using MongoDB, Express, React, and Node.js.',
    date: 'Nov 02, 2023',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'The Future of Social Media Marketing',
    category: 'Marketing',
    excerpt: 'How AI and short-form video are completely reshaping the way brands interact with consumers online.',
    date: 'Nov 15, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    title: 'Why UI/UX Design is Critical for Startup Success',
    category: 'Design',
    excerpt: 'Learn why investing in user experience design early on can save you thousands in development costs later.',
    date: 'Nov 28, 2023',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    title: 'A Beginner’s Guide to Video Editing with Premiere Pro',
    category: 'Video Editing',
    excerpt: 'Start your creative journey with this comprehensive introduction to timeline management and basic transitions.',
    date: 'Dec 05, 2023',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    title: 'Content Writing That Converts: Psychology of Copy',
    category: 'Content',
    excerpt: 'Stop writing for search engines and start writing for humans. The psychology behind high-converting landing pages.',
    date: 'Dec 12, 2023',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead27d2?auto=format&fit=crop&w=800&q=80',
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white relative overflow-hidden pt-20 pb-32">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] left-0 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
              Tech Blog
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">Industry News</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Stay ahead of the curve with expert tutorials, industry trends, and the latest news from the world of digital marketing and tech.
            </p>
          </div>

          {/* Featured Post (First one) */}
          <div className="mb-20">
            <Link href="#" className="group block relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-72 lg:h-[450px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={blogPosts[0].image} 
                    alt={blogPosts[0].title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-slate-900">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/20">
                      {blogPosts[0].category}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">{blogPosts[0].readTime}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-snug group-hover:text-orange-400 transition-colors">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8 line-clamp-3">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 p-0.5">
                        <div className="w-full h-full bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center text-xs font-bold text-white">
                          FM
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Flymedia Team</span>
                        <span className="text-xs text-slate-500">{blogPosts[0].date}</span>
                      </div>
                    </div>
                    <span className="text-orange-400 font-bold text-sm flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                      Read Article <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Grid of remaining posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link key={post.id} href="#" className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-slate-900 text-xs font-bold uppercase tracking-wider shadow-sm">
                      {post.category}
                    </span>
                  </div>
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-slate-500">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Read More</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter Subscribe */}
          <div className="mt-24 bg-gradient-to-br from-slate-900 to-black rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Never Miss an Update</h2>
              <p className="text-slate-400 mb-8 text-lg">Subscribe to our newsletter for the latest tech news, design trends, and exclusive course discounts.</p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:bg-slate-800 transition-all"
                  required
                />
                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
