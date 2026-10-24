import { requireAdmin } from '../../../src/lib/auth';
import { Payment, User, Package, Inquiry } from '../../../src/db/models';
import Pagination from '../../../src/components/admin/Pagination';
import PaymentsTable from '../../../src/components/admin/PaymentsTable';

export const revalidate = 0;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const [allPayments, paginatedData] = await Promise.all([
    Payment.findAll({ attributes: ['amount', 'status'] }),
    Payment.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'freeDemoCredits', 'referralCode'],
          required: false,
        },
        {
          model: Package,
          attributes: ['id', 'title', 'slug', 'thumbnail', 'price'],
          required: false,
        },
      ],
    }),
  ]);

  const rawPayments = paginatedData.rows.map((p) => p.toJSON() as any);

  // Retrieve inquiries to fallback phone numbers if student entered it during demo checkout
  const userEmails = [...new Set(rawPayments.map((p: any) => p.User?.email).filter(Boolean))];
  const phoneByEmail = new Map<string, string>();
  if (userEmails.length > 0) {
    const inquiries = await Inquiry.findAll({
      where: { email: userEmails },
      attributes: ['email', 'phone'],
      order: [['createdAt', 'DESC']],
    });
    inquiries.forEach((inq) => {
      if (inq.phone && !phoneByEmail.has(inq.email)) {
        phoneByEmail.set(inq.email, inq.phone);
      }
    });
  }

  const payments = rawPayments.map((p: any) => ({
    id: p.id,
    transactionId: p.transactionId,
    amount: p.amount,
    status: p.status,
    provider: p.provider,
    createdAt: p.createdAt,
    user: p.User
      ? {
          id: p.User.id,
          name: p.User.name,
          email: p.User.email,
          phone: p.User.phone || (p.User.email ? phoneByEmail.get(p.User.email) : null) || null,
          avatar: p.User.avatar,
          role: p.User.role,
          freeDemoCredits: p.User.freeDemoCredits,
          referralCode: p.User.referralCode,
        }
      : null,
    package: p.Package
      ? {
          id: p.Package.id,
          title: p.Package.title,
          slug: p.Package.slug,
          thumbnail: p.Package.thumbnail,
          price: p.Package.price,
        }
      : null,
  }));

  const totalPages = Math.ceil(paginatedData.count / limit) || 1;

  const totalRevenue = allPayments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const successfulTransactions = allPayments.filter((p) => p.status === 'SUCCESS').length;
  const refunds = allPayments.filter((p) => p.status === 'FAILED').length;

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments & Revenue</h1>
          <p className="text-sm text-slate-500">Track transactions, customer details, and booking analytics.</p>
        </div>
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

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-400">View student contact info, programs booked, and transaction statuses</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {paginatedData.count} Total Records
          </span>
        </div>

        <PaymentsTable payments={payments} />
      </div>
    </div>
  );
}
