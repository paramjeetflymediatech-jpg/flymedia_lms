import { requireAdmin } from '../../../src/lib/auth';
import { Payment } from '../../../src/db/models';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deletePaymentAction } from '../../actions';

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const paymentsData = await Payment.findAll();
  const payments = paymentsData.map(p => p.toJSON());
  
  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);
    
  const successfulTransactions = payments.filter(p => p.status === 'SUCCESS').length;
  const refunds = payments.filter(p => p.status === 'FAILED').length; // For simplicity, using failed as refunds or just 0

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments & Revenue</h1>
          <p className="text-sm text-slate-500">Track transactions, refunds, and revenue analytics.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
          <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-slate-500">Lifetime earnings</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</span>
          <div className="text-3xl font-black text-slate-900">{successfulTransactions}</div>
          <p className="text-xs text-slate-500">Total successful payments</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed / Refunds</span>
          <div className="text-3xl font-black text-slate-900">{refunds}</div>
          <p className="text-xs text-slate-500">Failed transactions</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl rounded-bl-xl">Transaction ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl rounded-br-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.transactionId}</td>
                    <td className="px-4 py-3 font-bold">₹{Number(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                        p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        p.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{p.batchMode}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Edit Payment">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <DeleteConfirmButton 
                          itemType="Payment" 
                          onDelete={async () => {
                            'use server';
                            await deletePaymentAction(p.id);
                          }} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
