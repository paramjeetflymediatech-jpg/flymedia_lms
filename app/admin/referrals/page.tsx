import { requireAdmin } from '../../../src/lib/auth';
import { User, Referral } from '../../../src/db/models';
import { Op } from 'sequelize';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.search?.trim() || '';

  // 1. Fetch all referrals for platform-wide metrics
  const allReferrals = await Referral.findAll({
    include: [
      {
        model: User,
        as: 'referrer',
        attributes: ['id', 'name', 'email', 'phone', 'referralCode'],
      },
      {
        model: User,
        as: 'referredUser',
        attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  // 2. Fetch all students who have referrals or codes
  const userWhere: any = { role: 'STUDENT' };
  if (searchQuery) {
    userWhere[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { email: { [Op.like]: `%${searchQuery}%` } },
      { referralCode: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  const allStudents = await User.findAll({
    where: userWhere,
    attributes: [
      'id',
      'name',
      'email',
      'phone',
      'avatar',
      'referralCode',
      'referredBy',
      'referralsCount',
      'freeDemoCredits',
      'createdAt',
    ],
    include: [
      {
        model: Referral,
        as: 'referralsGiven',
        include: [
          {
            model: User,
            as: 'referredUser',
            attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
          },
        ],
      },
    ],
    order: [['referralsCount', 'DESC'], ['createdAt', 'DESC']],
  });

  // Calculate platform metrics
  const totalReferrals = allReferrals.length;
  const activeReferrersCount = allStudents.filter((s) => (s.referralsCount || 0) > 0).length;
  
  // Total demo class rewards earned by all students = total successful referrals
  const totalRewardsGranted = totalReferrals;
  // Current free demo credits remaining across all students
  const totalRewardsLeft = allStudents.reduce((sum, s) => sum + (s.freeDemoCredits || 0), 0);
  // Total rewards used = granted - remaining
  const totalRewardsUsed = Math.max(0, totalRewardsGranted - totalRewardsLeft);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refer & Earn App Chain</h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700">
              ₹99 Demo Class Reward
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Track student referral chains, who invited whom, total rewards granted, rewards redeemed, and remaining balance.
          </p>
        </div>

        {/* Search Input */}
        <form className="flex items-center gap-2">
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search student or code..."
            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all w-64 shadow-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Search
          </button>
          {searchQuery && (
            <Link
              href="/admin/referrals"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total App Referrals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Referrals</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalReferrals}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Friends successfully joined</p>
        </div>

        {/* Active Referrers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Referrers</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{activeReferrersCount}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Students sharing code</p>
        </div>

        {/* Total Rewards Granted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rewards Granted</p>
          <p className="text-3xl font-black text-rose-600 mt-1">{totalRewardsGranted}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Free ₹99 demos awarded</p>
        </div>

        {/* Total Rewards Used */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rewards Used</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{totalRewardsUsed}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Free demo classes booked</p>
        </div>

        {/* Total Rewards Left */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rewards Left</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{totalRewardsLeft}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Active student credit balance</p>
        </div>
      </div>

      {/* STUDENT REFERRAL CHAIN TABLE */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Student Referral Performance & Rewards</h2>
            <p className="text-xs text-slate-500 font-medium">
              List of all students with their referral counts, free demo rewards earned, used, and remaining balance.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Showing {allStudents.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Referral Code</th>
                <th className="px-6 py-4 text-center">Friends Referred</th>
                <th className="px-6 py-4 text-center">Rewards Granted</th>
                <th className="px-6 py-4 text-center">Rewards Used</th>
                <th className="px-6 py-4 text-center">Rewards Left</th>
                <th className="px-6 py-4 text-right">Referral Chain Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                allStudents.map((student: any) => {
                  const referrals = student.referralsGiven || [];
                  const count = student.referralsCount || referrals.length || 0;
                  const rewardsEarned = count;
                  const rewardsLeft = student.freeDemoCredits || 0;
                  const rewardsUsed = Math.max(0, rewardsEarned - rewardsLeft);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{student.name || 'Unnamed Student'}</div>
                            <div className="text-xs text-slate-400 font-medium">{student.email}</div>
                            {student.phone && (
                              <div className="text-[11px] text-slate-500">{student.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {student.referralCode || 'NOT_GENERATED'}
                        </span>
                      </td>

                      {/* Friends Referred */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center font-black text-sm px-3 py-1 rounded-full ${
                          count > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </td>

                      {/* Rewards Granted */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {rewardsEarned}
                        </span>
                        <div className="text-[10px] text-slate-400">Demo Classes</div>
                      </td>

                      {/* Rewards Used */}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-extrabold text-sm ${rewardsUsed > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                          {rewardsUsed}
                        </span>
                        <div className="text-[10px] text-slate-400">Redeemed</div>
                      </td>

                      {/* Rewards Left */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center font-black text-sm px-2.5 py-1 rounded-full ${
                          rewardsLeft > 0 ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {rewardsLeft} Left
                        </span>
                      </td>

                      {/* Friends Chain Details */}
                      <td className="px-6 py-4 text-right">
                        {referrals.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No friends joined yet</span>
                        ) : (
                          <details className="group/chain text-left inline-block">
                            <summary className="cursor-pointer text-xs font-bold text-rose-600 hover:text-rose-700 list-none inline-flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors">
                              <span>See {referrals.length} Friends Chain</span>
                              <span className="group-open/chain:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 min-w-[280px] shadow-sm">
                              {referrals.map((refItem: any, idx: number) => {
                                const friend = refItem.referredUser;
                                return (
                                  <div key={refItem.id || idx} className="text-xs border-b border-slate-200/60 pb-2 last:border-b-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900">{friend?.name || 'Friend'}</span>
                                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                        +1 Demo Free
                                      </span>
                                    </div>
                                    <div className="text-slate-500 text-[11px]">{friend?.email}</div>
                                    <div className="text-slate-400 text-[10px] mt-0.5">
                                      Joined on {new Date(refItem.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT PLATFORM-WIDE REFERRAL ACTIVITY LOG */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-1">Recent Referral Event Log</h3>
        <p className="text-xs text-slate-500 mb-5 font-medium">Real-time record of all student invites and free demo activations.</p>

        {allReferrals.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No referral events recorded in the database yet.
          </div>
        ) : (
          <div className="space-y-3">
            {allReferrals.slice(0, 15).map((refItem: any) => (
              <div
                key={refItem.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
                    🎁
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      <strong className="text-rose-600">{refItem.referrer?.name || 'Student'}</strong> successfully referred{' '}
                      <strong className="text-slate-800">{refItem.referredUser?.name || 'Friend'}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Code: <span className="font-mono font-bold text-slate-600">{refItem.referralCode}</span> • Friend Email: {refItem.referredUser?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Free ₹99 Demo Granted
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(refItem.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
