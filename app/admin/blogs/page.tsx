import { requireAdmin } from '../../../src/lib/auth';
import { BlogPost, User } from '../../../src/db/models';
import { adminDeleteBlogPost } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import Pagination from '../../../src/components/admin/Pagination';
import Link from 'next/link';
import { Op } from 'sequelize';

export const revalidate = 0; // Fresh admin logs

export default async function AdminBlogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const searchParam = resolvedSearchParams?.search as string || '';
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereClause = searchParam ? {
    title: { [Op.like]: `%${searchParam}%` }
  } : {};

  const { count, rows } = await BlogPost.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['name', 'email']
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  
  const posts = rows.map(p => p.toJSON());
  const totalPages = Math.ceil(count / limit) || 1;

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Blog Management</h1>
          <p className="text-sm text-slate-500">Create and manage blog posts.</p>
        </div>
        <Link 
          href="/admin/blogs/new" 
          className="inline-flex items-center justify-center px-6 py-3 font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-md transition-all gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Create New Post
        </Link>
      </div>

      <div className="space-y-6 max-w-7xl pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-2xl font-extrabold text-slate-900">Your Blog Posts</h3>
          
          <form method="GET" action="/admin/blogs" className="flex items-center gap-2 max-w-sm w-full">
            <input 
              type="text" 
              name="search" 
              defaultValue={searchParam}
              placeholder="Search blogs..." 
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm">
              Search
            </button>
            {searchParam && (
              <Link href="/admin/blogs" className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                Clear
              </Link>
            )}
          </form>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl text-slate-500 font-medium">
            No blog posts created yet. Click "Create New Post" above to get started.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center border border-slate-200">
                        {post.image ? (
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight line-clamp-1">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${post.status === 'PUBLISHED' ? 'text-green-700 bg-green-100' : 'text-purple-700 bg-purple-100'}`}>
                            {post.status}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {post.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 border-l border-slate-300 pl-2">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/admin/blogs/${post.id}`}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 hover:bg-blue-100 rounded-xl"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <DeleteConfirmButton
                        itemType="Blog Post"
                        onDelete={adminDeleteBlogPost.bind(null, post.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination 
              page={page} 
              totalPages={totalPages} 
              totalItems={count} 
              limit={limit} 
              baseUrl="/admin/blogs" 
            />
          </>
        )}
      </div>
    </div>
  );
}
