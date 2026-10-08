import { requireAdmin } from '../../../../src/lib/auth';
import { Inquiry } from '../../../../src/db/models';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LeadStatusSelect from '../../../../src/components/admin/LeadStatusSelect';

export default async function ViewLeadPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireAdmin();

  const lead = await Inquiry.findByPk(params.id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <Link href="/admin/leads">
          <button className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lead Details</h1>
          <p className="text-xs font-semibold text-slate-400">ID: {lead.id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Meta */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Status</span>
              <LeadStatusSelect leadId={lead.id} initialStatus={lead.status} />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted On</span>
              <span className="text-sm font-semibold text-slate-700">
                {new Date(lead.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Updated</span>
              <span className="text-sm font-semibold text-slate-700">
                {new Date(lead.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Data */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-8">
            
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</span>
                  <span className="text-sm font-bold text-slate-800">{lead.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</span>
                  <a href={`tel:${lead.phone}`} className="text-sm font-bold text-orange-600 hover:underline">{lead.phone}</a>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
                  <a href={`mailto:${lead.email}`} className="text-sm font-bold text-orange-600 hover:underline">{lead.email}</a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Message</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {lead.message}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
