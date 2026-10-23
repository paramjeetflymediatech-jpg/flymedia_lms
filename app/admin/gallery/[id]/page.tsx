import { requireAdmin } from '../../../../src/lib/auth';
import { GalleryItem } from '../../../../src/db/models';
import GalleryForm from '../GalleryForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const item = await GalleryItem.findByPk(id);
  if (!item) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/gallery"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Edit Success Media</h1>
          <p className="text-slate-500 text-sm">{item.title}</p>
        </div>
      </div>

      <GalleryForm initialData={item.toJSON()} />
    </div>
  );
}
