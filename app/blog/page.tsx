import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';
import { BlogPost, User } from '../../src/db/models';
import NewsletterForm from '../../src/components/blog/NewsletterForm';
import { Op } from 'sequelize';
import { Suspense } from 'react';
import BlogSearch from '../../src/components/blog/BlogSearch';

export const metadata = {
  title: 'Tech Blog | Flymedia Technology',
  description: 'Latest insights, tutorials, and industry news from Flymedia Technology.',
};

export const revalidate = 0; // Fresh blog posts

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const searchQuery = typeof resolvedSearchParams?.search === 'string' ? resolvedSearchParams.search : '';
  
  const limit = 6;
  const offset = (page - 1) * limit;

  const whereClause: any = { status: 'PUBLISHED' };
  if (searchQuery) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${searchQuery}%` } },
      { excerpt: { [Op.like]: `%${searchQuery}%` } },
      { '$author.name$': { [Op.like]: `%${searchQuery}%` } }
    ];
  }

  const { count, rows } = await BlogPost.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['name']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit) || 1;
  const gridPosts = rows.map(p => p.toJSON() as any);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#FAFAFA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div>
              <h1 className="text-[2.75rem] font-black text-slate-900 leading-tight tracking-tight mb-2">
                Our <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Blog</span>
              </h1>
              <p className="text-slate-600 text-base">
                Latest news, maintenance tips, and expert advice for your home and trade.
              </p>
            </div>
            <div className="w-full lg:w-80">
              <Suspense fallback={<div className="h-11 w-full bg-slate-100 animate-pulse rounded-xl" />}>
                <BlogSearch />
              </Suspense>
            </div>
          </div>

          {gridPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {searchQuery ? 'No Results Found' : 'No Posts Yet'}
              </h3>
              <p className="text-slate-500">
                {searchQuery ? `We couldn't find any articles matching "${searchQuery}".` : 'Check back later for new insights and updates.'}
              </p>
            </div>
          ) : (
            <>
              {/* Grid of posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
                    {/* Image */}
                    <div className="h-[200px] w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={post.image || 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white text-[#1A56DB] text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {post.category || 'ARTICLE'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4 text-[13px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{post.author?.name || 'Admin'}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-[1.15rem] font-bold text-slate-900 mb-3 leading-snug group-hover:text-[#1A56DB] transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-[13px] text-slate-500 leading-relaxed mb-6 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-auto pt-2">
                        <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-sm font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent hover:text-blue-800 transition-colors">
                          Read More <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-16">
                  {page > 1 ? (
                    <Link href={`/blog?page=${page - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`} className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                      Previous
                    </Link>
                  ) : (
                    <span className="px-6 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  
                  <span className="text-sm font-bold text-slate-500 px-4">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link href={`/blog?page=${page + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`} className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                      Next
                    </Link>
                  ) : (
                    <span className="px-6 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* Newsletter Subscribe - Kept as is at the bottom */}
          <div className="mt-24 bg-gradient-to-br from-slate-900 to-black rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Never Miss an Update</h2>
              <p className="text-slate-400 mb-8 text-lg">Subscribe to our newsletter for the latest tech news, design trends, and exclusive course discounts.</p>
              
              <NewsletterForm />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
