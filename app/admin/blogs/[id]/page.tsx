import { requireAdmin } from '../../../../src/lib/auth';
import { BlogPost } from '../../../../src/db/models';
import { adminUpdateBlogPost } from '../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThumbnailUpload from '../../../../src/components/admin/ThumbnailUpload';
import RichTextEditor from '../../../../src/components/admin/RichTextEditor';
import CategoryNameSlugInputs from '../../../../src/components/admin/CategoryNameSlugInputs';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const resolvedParams = await params;
  const post = await BlogPost.findByPk(resolvedParams.id);

  if (!post) {
    redirect('/admin/blogs');
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Blog Post</h1>
          <p className="text-sm text-slate-500">Update details for this blog post.</p>
        </div>
        <Link href="/admin/blogs" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Blogs
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Post Details</h3>
        
        <form action={async (formData) => {
          'use server';
          const res = await adminUpdateBlogPost(post.id, formData);
          if (res?.success) {
            redirect('/admin/blogs');
          }
        }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <CategoryNameSlugInputs 
                initialName={post.title}
                initialSlug={post.slug}
                layout="grid" 
                nameLabel="Post Title" 
                nameField="title"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <input
                name="category"
                type="text"
                required
                defaultValue={post.category}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Read Time</label>
              <input
                name="readTime"
                type="text"
                defaultValue={post.readTime || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                defaultValue={post.status}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Excerpt (Short Summary)</label>
            <textarea
              name="excerpt"
              required
              rows={3}
              defaultValue={post.excerpt}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Content</label>
            <RichTextEditor name="content" defaultValue={post.content} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Update Blog Image (Local)</label>
              {post.image && !post.image.startsWith('http') && (
                <div className="mb-2 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                  <img src={post.image} alt="Current thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
              <ThumbnailUpload name="imageFile" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Or enter Image URL</label>
              <input
                name="imageUrl"
                type="text"
                placeholder="Enter image URL"
                defaultValue={post.image?.startsWith('http') ? post.image : ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">SEO Settings (Optional)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meta Title</label>
                <input
                  name="metaTitle"
                  type="text"
                  defaultValue={post.metaTitle || ''}
                  placeholder="e.g. Best SEO Practices | Flymedia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keywords</label>
                <input
                  name="keywords"
                  type="text"
                  defaultValue={post.keywords || ''}
                  placeholder="e.g. seo, marketing, tips"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meta Description</label>
              <textarea
                name="metaDescription"
                rows={2}
                defaultValue={post.metaDescription || ''}
                placeholder="Brief description of the page for search engines..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">OG Title (Social Share)</label>
                <input
                  name="ogTitle"
                  type="text"
                  defaultValue={post.ogTitle || ''}
                  placeholder="e.g. Learn Web Development"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">OG Description</label>
                <textarea
                  name="ogDescription"
                  rows={2}
                  defaultValue={post.ogDescription || ''}
                  placeholder="Description for social sharing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Header Script</label>
                <textarea
                  name="headerScript"
                  rows={2}
                  defaultValue={post.headerScript || ''}
                  placeholder="<script>...</script>"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Footer Script</label>
                <textarea
                  name="footerScript"
                  rows={2}
                  defaultValue={post.footerScript || ''}
                  placeholder="<script>...</script>"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all shadow-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
