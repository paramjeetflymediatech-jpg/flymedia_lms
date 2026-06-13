import { requireAdmin } from '../../../src/lib/auth';
import { Package, LiveClass } from '../../../src/db/models';
import { adminDeletePackage } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import Link from 'next/link';

export const revalidate = 0; // Fresh admin logs

export default async function AdminPackagesPage() {
  await requireAdmin();

  const packagesData = await Package.findAll({
    include: [
      {
        model: LiveClass,
        as: 'liveClasses',
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  
  const packages = packagesData.map(c => c.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Package Management</h1>
          <p className="text-sm text-slate-500">Create and manage packages and live classes.</p>
        </div>
        <Link 
          href="/admin/packages/new" 
          className="inline-flex items-center justify-center px-6 py-3 font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-md transition-all gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Create New Package
        </Link>
      </div>

      <div className="space-y-6 max-w-7xl pt-4">
        <h3 className="text-2xl font-extrabold text-slate-900">Your Packages</h3>

        {packages.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl tex/admin/users/admin/users/admin/users/admin/userst-slate-500 font-medium">
            No packages created yet. Click "Create New Package" above to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{pkg.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-purple-700 px-2.5 py-0.5 rounded-full bg-purple-100">
                          {pkg.status}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {pkg.liveClasses?.length || 0} Live Classes
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 border-l border-slate-300 pl-2">
                          {pkg.price ? `₹${pkg.price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/admin/packages/edit/${pkg.id}`}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 hover:bg-blue-100 rounded-xl"
                      title="Manage"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <DeleteConfirmButton
                      itemType="Package"
                      onDelete={adminDeletePackage.bind(null, pkg.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
