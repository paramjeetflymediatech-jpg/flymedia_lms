import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '../../../../src/lib/auth';
import { TutorApplication } from '../../../../src/db/models';
import { rejectTutorApplication, approveTutorApplication } from '../../../actions';

export const revalidate = 0;

export default async function TutorApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const application = await TutorApplication.findByPk(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/tutor-applications"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Application Details</h1>
          <p className="text-sm text-slate-500">Review full information before approving or rejecting.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
              {application.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{application.fullName}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-xs uppercase font-bold rounded-full border 
                  ${application.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 
                    application.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-orange-50 text-orange-600 border-orange-100'}`}
                >
                  {application.status}
                </span>
                <span className="text-sm text-slate-500 font-medium">Applied {new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {application.status === 'PENDING' && (
            <div className="flex items-center gap-3">
              <form action={async () => { 'use server'; await rejectTutorApplication(application.id); }}>
                <button type="submit" className="px-5 py-2.5 rounded-xl border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-colors">
                  Reject
                </button>
              </form>
              <form action={async () => { 'use server'; await approveTutorApplication(application.id); }}>
                <button type="submit" className="px-5 py-2.5 rounded-xl border-2 border-green-600 bg-green-600 text-white hover:bg-green-700 font-bold text-sm transition-colors shadow-sm">
                  Approve & Invite
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Email</div>
                    <div className="text-sm font-semibold text-slate-900">{application.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Phone</div>
                    <div className="text-sm font-semibold text-slate-900">{application.phone}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Expertise</h3>
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-xl border border-blue-100 shadow-sm">
                {application.expertise}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Professional Experience & Background</h3>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm text-slate-700 leading-relaxed min-h-[200px] whitespace-pre-wrap">
              {application.experience}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
