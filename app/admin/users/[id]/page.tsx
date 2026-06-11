import { requireAdmin } from '../../../../src/lib/auth';
import { User, Enrollment, Package } from '../../../../src/db/models';
import Link from 'next/link';

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  
  const resolvedParams = await params;

  const userData = await User.findByPk(resolvedParams.id, {
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        include: [
          {
            model: Package,
            as: 'Package',
            attributes: ['id', 'title'],
          },
        ],
      },
    ]
  });

  if (!userData) {
    return (
      <div className="p-6 md:p-10">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          User not found.
        </div>
        <Link href="/admin/users" className="mt-4 inline-block text-blue-600 hover:underline">
          &larr; Back to Users
        </Link>
      </div>
    );
  }

  const user = userData.toJSON() as any;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/admin/users" className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Details</h1>
          </div>
          <p className="text-sm text-slate-500 pl-9">ID: {user.id}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/admin/users/${user.id}/edit`}
            className="px-4 py-2 uppercase font-bold rounded-lg border text-sm tracking-wider bg-white text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Edit
          </Link>
          <span className={`px-4 py-2 uppercase font-bold rounded-lg border text-sm tracking-wider
            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
              user.role === 'TUTOR' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              'bg-slate-100 text-slate-700 border-slate-200'}`}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Profile Information</h2>
          <div className="flex items-start gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-200 shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-bold text-lg text-slate-900">{user.name || 'No Name Provided'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold text-slate-700">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Joined Date</p>
                <p className="font-semibold text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {user.bio && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Bio</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Enrollments Info */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Enrollments</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {user.enrollments?.length || 0} Total
            </span>
          </div>
          
          {user.enrollments && user.enrollments.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {user.enrollments.map((enr: any) => (
                <div key={enr.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{enr.Package?.title || 'Unknown Package'}</h3>
                    <p className="text-xs text-slate-500">Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}</p>
                  </div>
                  <Link 
                    href={`/admin/enrollments/${enr.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View &rarr;
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded-2xl border border-slate-100">
              This user has no active enrollments.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
