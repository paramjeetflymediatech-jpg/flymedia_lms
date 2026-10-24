import { requireAuth } from '../../../src/lib/auth';
import { User, Referral } from '../../../src/db/models';
import { generateReferralCode } from '../../../src/lib/referral';
import StudentReferralInvite from '../../../src/components/dashboard/StudentReferralInvite';
import Link from 'next/link';

export const revalidate = 0;

export default async function StudentReferralsPage() {
  const sessionUser = await requireAuth();

  const studentProfile = await User.findByPk(sessionUser.id, {
    attributes: ['id', 'name', 'email', 'referralCode', 'referralsCount', 'freeDemoCredits'],
    include: [
      {
        model: Referral,
        as: 'referralsGiven',
        include: [{ model: User, as: 'referredUser', attributes: ['id', 'name', 'createdAt', 'email'] }],
      },
    ],
    order: [[{ model: Referral, as: 'referralsGiven' }, 'createdAt', 'DESC']],
  });

  // Ensure referral code is saved
  let referralCode = studentProfile?.referralCode;
  if (!referralCode && studentProfile) {
    referralCode = generateReferralCode(studentProfile.name);
    studentProfile.referralCode = referralCode;
    await studentProfile.save().catch(() => {});
  }
  if (!referralCode) {
    referralCode = `FLY-${sessionUser.id.slice(0, 6).toUpperCase()}`;
  }

  const friendsReferred = studentProfile?.referralsCount || (studentProfile?.referralsGiven?.length || 0);
  const freeDemosLeft = studentProfile?.freeDemoCredits || 0;
  const freeDemosUsed = Math.max(0, friendsReferred - freeDemosLeft);
  const referrals = studentProfile?.referralsGiven || [];

  const referredFriendsList = referrals.map((r: any) => ({
    id: r.id,
    friendName: r.referredUser?.name || 'Friend',
    joinedAt: r.createdAt,
    rewardStatus: 'Free ₹99 Demo Class Unlocked',
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800">Refer & Earn</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Invite Program & Rewards
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Share your referral invite link with fellow learners. Each friend who joins unlocks a Free ₹99 Live 1-on-1 Demo Class with expert mentors for both of you!
        </p>
      </div>

      {/* Main Invite Component */}
      <StudentReferralInvite
        referralCode={referralCode}
        friendsReferred={friendsReferred}
        freeDemosLeft={freeDemosLeft}
        freeDemosUsed={freeDemosUsed}
        referredFriends={referredFriendsList}
        compact={false}
      />

      {/* Detailed Referral History Chain Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Referral Activity History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of everyone who signed up using your link or code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              Total Earned: {friendsReferred} Credits
            </span>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-2xl mx-auto">
              🎁
            </div>
            <p className="text-base font-bold text-slate-700">No friends referred yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Copy your unique invite link above and send it to your friends or share on WhatsApp to start earning free demo credits!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Student Name</th>
                  <th className="pb-3 px-4">Joined Date</th>
                  <th className="pb-3 px-4">Reward Granted</th>
                  <th className="pb-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {referrals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {(r.referredUser?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{r.referredUser?.name || 'Fellow Student'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {r.referredUser?.email ? r.referredUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'Registered'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        <span>✨</span>
                        <span>1 Free ₹99 Demo Pass</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        Credited
                      </span>
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
