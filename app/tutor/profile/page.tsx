import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { User } from '../../../src/db/models';
import { updateTutorProfile } from '../../actions';
import { ProfileForm } from './ProfileForm';

export const revalidate = 0;

export default async function TutorProfilePage() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  const dbUser = await User.findByPk(user.id);
  const bio = dbUser?.bio || '';
  const avatar = dbUser?.avatar || null;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tutor Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your public instructor profile and personal details.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-orange-100 border-2 border-orange-200 flex flex-col items-center justify-center text-orange-600 font-bold text-2xl flex-shrink-0 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (dbUser?.name || 'Tutor').substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="space-y-1 flex-1">
            <h2 className="text-xl font-bold text-slate-900">{dbUser?.name || 'Tutor'}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
               <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                 Role: Instructor
               </span>
            </div>
          </div>
        </div>

        <ProfileForm initialBio={bio} userName={dbUser?.name || ''} userEmail={user.email} />
      </div>
    </div>
  );
}
