import { requireAdmin } from '../../../../src/lib/auth';
import { adminCreateBlogPost } from '../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThumbnailUpload from '../../../../src/components/admin/ThumbnailUpload';
import RichTextEditor from '../../../../src/components/admin/RichTextEditor';

export default async function CreateBlogPostPage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Blog Post</h1>
          <p className="text-sm text-slate-500">Add a new post to the blog.</p>
        </div>
        <Link href="/admin/blogs" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Blogs
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Post Details</h3>
        
        <form action={async (formData) => {
          'use server';
          const res = await adminCreateBlogPost(formData);
          if (res?.success) {
            redirect('/admin/blogs');
          }
        }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Post Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                placeholder="e.g. 10 Best SEO Practices in 2024"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <input
                name="category"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                placeholder="e.g. SEO, Marketing"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Read Time</label>
              <input
                name="readTime"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                placeholder="e.g. 5 min read"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                defaultValue="DRAFT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 bg-white"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              placeholder="Short summary for the blog listing page..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Content</label>
            <RichTextEditor name="content" defaultValue="" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Blog Image (Local)</label>
              <ThumbnailUpload name="imageFile" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Or enter Image URL</label>
              <input
                name="imageUrl"
                type="text"
                placeholder="Enter image URL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md text-sm"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
