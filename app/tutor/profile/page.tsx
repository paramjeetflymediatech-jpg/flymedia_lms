import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { User } from '../../../src/db/models';
import { updateTutorProfile } from '../../actions';
import ProfileForm from '../../../src/components/profile/ProfileForm';

export const revalidate = 0;

export default async function TutorProfilePage() {
  const sessionUser = await requireAuth();
  
  if (sessionUser.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  const dbUser = await User.findByPk(sessionUser.id);
  const user = dbUser ? dbUser.toJSON() as any : sessionUser;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tutor Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your public instructor profile and personal details.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Form Content */}
        <ProfileForm user={user} updateAction={updateTutorProfile} />
      </div>
    </div>
  );
}
