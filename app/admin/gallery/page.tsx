import { requireAdmin } from '../../../src/lib/auth';
import { GalleryItem } from '../../../src/db/models';
import Link from 'next/link';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deleteGalleryItem } from './actions';

export default async function AdminGalleryPage() {
  await requireAdmin();

  let items: GalleryItem[] = [];
  let errorMsg = null;

  try {
    await GalleryItem.sync({ alter: true });
    items = await GalleryItem.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
  } catch (e: any) {
    console.error(e);
    errorMsg = 'Failed to load gallery items. Database might need syncing.';
  }

  const totalVideos = items.filter((i) => i.mediaType === 'VIDEO').length;
  const totalImages = items.filter((i) => i.mediaType === 'IMAGE').length;
  const totalActive = items.filter((i) => i.isActive).length;

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-wider mb-2">
            📸 Student Showcase
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">
            Success Gallery & Video Reviews
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload student placement photos, project demos, and video testimonials to showcase success rates and real reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            target="_blank"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            <span>👁️</span> View Public Gallery
          </Link>
          <Link
            href="/admin/gallery/new"
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-md shadow-orange-500/20 text-sm flex items-center gap-2"
          >
            <span>+</span> Add Media / Story
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">🎥 Video Reviews</p>
          <p className="text-3xl font-black text-rose-600 mt-1">{totalVideos}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">📷 Photos & Placements</p>
          <p className="text-3xl font-black text-orange-600 mt-1">{totalImages}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">✅ Live Published</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{totalActive}</p>
        </div>
      </div>

      {errorMsg ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold">
          {errorMsg}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-4xl mx-auto">
            🎬
          </div>
          <h3 className="text-2xl font-black text-slate-900">No Gallery Media Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Start uploading success images of placed students, award ceremonies, and video reviews to boost trust and enrollment conversions.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/gallery/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-xl hover:opacity-90 transition-all text-sm shadow-md shadow-orange-500/25"
            >
              Upload First Success Story
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Media</th>
                  <th className="px-6 py-4">Title & Story</th>
                  <th className="px-6 py-4">Student & Course</th>
                  <th className="px-6 py-4">Company / Package</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        {item.mediaType === 'VIDEO' ? (
                          <>
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                                <span className="text-2xl">🎥</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="w-6 h-6 rounded-full bg-white/90 text-orange-600 flex items-center justify-center text-xs font-black">
                                ▶
                              </span>
                            </div>
                          </>
                        ) : (
                          <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                      )}
                      <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.studentName ? (
                        <>
                          <div className="font-bold text-slate-800">{item.studentName}</div>
                          <div className="text-xs text-slate-500">{item.courseName || 'Career Track'}</div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.companyPlaced ? (
                        <div>
                          <span className="font-bold text-slate-900">{item.companyPlaced}</span>
                          {item.salaryPackage && (
                            <span className="block text-xs font-black text-emerald-600">{item.salaryPackage}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-amber-500 font-bold text-xs">
                        {'★'.repeat(item.rating || 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/gallery/${item.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteConfirmButton
                          itemType="Gallery Item"
                          onDelete={async () => {
                            'use server';
                            await deleteGalleryItem(item.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
