import { requireAdmin } from '../../../src/lib/auth';
import { Inquiry } from '../../../src/db/models';
import { adminDeleteInquiry } from '../../actions';
import LeadStatusSelect from '../../../src/components/admin/LeadStatusSelect';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminLeadsPage() {
  await requireAdmin();

  const leads = await Inquiry.findAll({
    order: [['createdAt', 'DESC']],
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leads & Inquiries</h1>
          <p className="text-sm font-medium text-slate-500">Manage contact requests and student leads.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No leads or inquiries found.
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.email}</div>
                      <div className="text-xs font-medium text-orange-600 mt-0.5">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs break-words">
                      {lead.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LeadStatusSelect leadId={lead.id} initialStatus={lead.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link href={`/admin/leads/${lead.id}`}>
                        <button className="text-xs font-bold text-orange-600 hover:text-white transition-colors px-4 py-1.5 bg-orange-50 hover:bg-orange-600 rounded-lg border border-orange-100 hover:border-orange-600 shadow-sm">
                          View
                        </button>
                      </Link>
                      <form action={async () => {
                        'use server';
                        await adminDeleteInquiry(lead.id);
                      }} className="inline-block">
                        <button type="submit" className="text-xs font-bold text-rose-500 hover:text-white transition-colors px-4 py-1.5 bg-rose-50 hover:bg-rose-500 rounded-lg border border-rose-100 hover:border-rose-500 shadow-sm ml-2">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
