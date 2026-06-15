import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { BlogPost, User } from '../../../src/db/models';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function SingleBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const post = await BlogPost.findOne({
    where: { slug: resolvedParams.slug, status: 'PUBLISHED' },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['name', 'bio']
      }
    ]
  });

  if (!post) {
    notFound();
  }

  const postData = post.toJSON() as any;

  return (
    <>
      <Header />
      <main className="flex-1 bg-white relative pt-24 pb-32">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] left-0 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors mb-8">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                {postData.category}
              </span>
              <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {postData.readTime || '5 min read'}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
              {postData.title}
            </h1>
            
            <div className="flex items-center gap-4 py-6 border-y border-slate-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 p-0.5">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-lg font-bold text-slate-900">
                  {postData.author?.name?.substring(0, 2).toUpperCase() || 'FM'}
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{postData.author?.name || 'Flymedia Team'}</div>
                <div className="text-sm text-slate-500">{new Date(postData.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {postData.image && (
            <div className="w-full rounded-3xl overflow-hidden mb-16 shadow-2xl shadow-slate-200/50 bg-slate-50 flex justify-center items-center">
              <img 
                src={postData.image} 
                alt={postData.title} 
                className="w-full h-auto max-h-[600px] object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-2xl">
            <div dangerouslySetInnerHTML={{ __html: postData.content }} />
          </div>

        </article>
      </main>
      <Footer />
    </>
  );
}
