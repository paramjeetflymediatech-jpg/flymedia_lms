import { requireAuth } from '../../../src/lib/auth';
import { User } from '../../../src/db/models';
import ProfileForm from '../../../src/components/profile/ProfileForm';
import { updateStudentProfile } from '../../actions';

export const revalidate = 0;

export default async function ProfilePage() {
  const sessionUser = await requireAuth();
  
  // Fetch full user from DB to get bio and avatar
  const dbUser = await User.findByPk(sessionUser.id);
  const user = dbUser ? dbUser.toJSON() as any : sessionUser;

  // Create initials for avatar fallback
  const initials = user.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'ST';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your personal information and account security.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Form Content */}
        <ProfileForm user={user} updateAction={updateStudentProfile} />
      </div>
    </div>
  );
}
