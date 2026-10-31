import { requireAdmin } from '../../../src/lib/auth';
import { InternshipApplication } from '../../../src/db/models';
import InternshipsClient from './InternshipsClient';

export const revalidate = 0;

export default async function AdminInternshipsPage() {
  await requireAdmin();

  // Ensure table exists
  try {
    await InternshipApplication.sync({ alter: true });
  } catch (err) {
    console.warn('InternshipApplication sync warning in admin:', err);
  }

  const applicationsData = await InternshipApplication.findAll({
    order: [['createdAt', 'DESC']],
  });

  const applications = applicationsData.map((app) => {
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
            <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-black uppercase rounded-lg border border-orange-200">
              🎓 Student Internship Desk
            </span>
            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-black uppercase rounded-lg border border-rose-200">
              Live Client Batches 2025 - 2026
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Internship Applications
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Review incoming student applications for 45 Days, 6 Weeks, 3 Months &amp; 6 Months Industrial Training programs.
          </p>
        </div>
      </div>

      <InternshipsClient initialApplications={applications} />
    </div>
  );
}

