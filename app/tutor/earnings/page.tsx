import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { Payment, Course } from '../../../src/db/models';

export const revalidate = 0;

export default async function TutorEarningsPage() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  // Fetch payments for courses taught by this tutor
  const paymentsData = await Payment.findAll({
    include: [
      {
        model: Course,
        where: { instructorId: user.id },
        attributes: ['title'],
      }
    ],
    order: [['createdAt', 'DESC']],
  });

  let totalLifetime = 0;
  
  const transactions = paymentsData.map(p => {
    const raw = p.get({ plain: true });
    
    // Add to lifetime earnings if success
    if (raw.status === 'SUCCESS' && raw.amount) {
      totalLifetime += parseFloat(raw.amount as unknown as string);
    }
    
    return { 
      id: raw.id.substring(0, 8).toUpperCase(), 
      date: new Date(raw.createdAt).toLocaleDateString(), 
      course: (raw as any).Course?.title || 'Unknown Course', 
      amount: raw.amount ? `$${parseFloat(raw.amount as unknown as string).toFixed(2)}` : '$0.00', 
      status: raw.status === 'SUCCESS' ? 'CLEARED' : raw.status 
    };
  });

  const availablePayout = totalLifetime * 0.8; // Assume 80% rev share for demonstration

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Earnings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your course sales, payouts, and revenue history.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-orange-700 transition-all">
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Available for Payout (80%)</p>
          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">${availablePayout.toFixed(2)}</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Pending Clearance</p>
          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">$0.00</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Lifetime Earnings</p>
          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">${totalLifetime.toFixed(2)}</h2>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{trx.id}</td>
                  <td className="px-6 py-4">{trx.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{trx.course}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{trx.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border inline-block
                      ${trx.status === 'CLEARED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}
                    >
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
