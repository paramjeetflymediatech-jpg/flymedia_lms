import { requireAdmin } from '../../../src/lib/auth';
import { PartnerApplication } from '../../../src/db/models';
import PartnershipsClient from './PartnershipsClient';

export const revalidate = 0;

export default async function AdminPartnershipsPage() {
  await requireAdmin();

  const applicationsData = await PartnerApplication.findAll({
    order: [['createdAt', 'DESC']],
  });

  const applications = applicationsData.map(app => {
    const json = app.get({ plain: true });
    return {
      ...json,
      createdAt: json.createdAt ? new Date(json.createdAt).toISOString() : new Date().toISOString(),
    };
  });


  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase rounded-lg border border-blue-200">
              Institutional &amp; NGO Desk
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase rounded-lg border border-emerald-200">
              100% Free Education CSR
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Partnerships &amp; Tie-Ups
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Review college collaboration proposals and empower charity trusts with 100% free education.
          </p>
        </div>
      </div>

      <PartnershipsClient initialApplications={applications} />
    </div>
  );
}
