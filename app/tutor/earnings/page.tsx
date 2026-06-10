import { requireAuth } from '../../../src/lib/auth';
import { LiveClass, Package } from '../../../src/db/models';
import { Op } from 'sequelize';

export const revalidate = 0;

export default async function TutorEarningsPage() {
  const user = await requireAuth();

  if (user.role !== 'TUTOR') {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
      </div>
    );
  }

  // Fetch all classes assigned to this tutor
  const classes = await LiveClass.findAll({
    where: { tutorId: user.id },
    include: [{ model: Package, attributes: ['title'] }],
    order: [['startTime', 'DESC']],
  });

  const now = new Date();
  const hourlyRate = 35; // Fixed placeholder rate of $35/hour for demonstration

  let totalEarnings = 0;
  let upcomingEarnings = 0;
  let totalHoursCompleted = 0;

  const earningsHistory = classes.map(c => {
    const classData = c.toJSON() as any;
    const endTime = new Date(new Date(classData.startTime).getTime() + classData.duration * 60000);
    const isCompleted = endTime < now;
    const hours = classData.duration / 60;
    const payout = hours * hourlyRate;

    if (isCompleted) {
      totalEarnings += payout;
      totalHoursCompleted += hours;
    } else {
      upcomingEarnings += payout;
    }

    return {
      ...classData,
      isCompleted,
      payout,
      hours,
    };
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Earnings & Payouts</h1>
        <p className="text-sm text-slate-500">Track your teaching revenue and upcoming scheduled payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Earned</h3>
          <div className="text-4xl font-black">${totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-slate-400 mt-2">Lifetime processed payouts</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming</h3>
          <div className="text-4xl font-black text-slate-900">${upcomingEarnings.toFixed(2)}</div>
          <p className="text-xs text-slate-500 mt-2">Pending from scheduled classes</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Hours Taught</h3>
          <div className="text-4xl font-black text-orange-600">{totalHoursCompleted.toFixed(1)}</div>
          <p className="text-xs text-slate-500 mt-2">Total completed class hours</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Payout History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Session Date</th>
                <th className="px-6 py-4">Live Class</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {earningsHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No earning history yet.
                  </td>
                </tr>
              ) : (
                earningsHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium">
                      {new Date(item.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.Package?.title || 'Unknown Package'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.hours.toFixed(1)} hrs
                    </td>
                    <td className="px-6 py-4">
                      {item.isCompleted ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-green-50 text-green-600 border border-green-100">
                          Processed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-orange-50 text-orange-600 border border-orange-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      ${item.payout.toFixed(2)}
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
