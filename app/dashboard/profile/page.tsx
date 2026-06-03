import { requireAuth } from '../../../src/lib/auth';
import { User } from '../../../src/db/models';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await requireAuth();

  // Server action to update profile
  async function updateProfile(formData: FormData) {
    'use server';
    const sessionUser = await requireAuth();
    const newName = formData.get('name') as string;
    
    if (newName && newName.trim() !== '') {
      await User.update({ name: newName.trim() }, { where: { id: sessionUser.id } });
      revalidatePath('/dashboard/profile');
      revalidatePath('/dashboard');
    }
  }

  // Create initials for avatar
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
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
        {/* Profile Banner */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
          {/* Decorative Pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-10 pb-10">
          {/* Avatar & Title */}
          <div className="relative flex justify-between items-end -mt-12 md:-mt-16 mb-8">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-md relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl md:text-5xl font-bold text-purple-600">
                  {initials}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold backdrop-blur-sm">
                  Change Photo
                </div>
              </div>
              <div className="mb-2 md:mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{user.name || 'Student Name'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            </div>
            
            <button className="hidden sm:inline-flex px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm mb-2">
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information Card */}
              <div className="border border-slate-100 rounded-2xl p-6 md:p-8 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-purple-600">👤</span> Personal Information
                </h3>
                
                <form action={updateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        defaultValue={user.name || ''} 
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-white shadow-sm"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user.email} 
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-white shadow-sm opacity-70"
                        disabled
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed directly.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        name="phone"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-white shadow-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Location (Optional)</label>
                      <input 
                        type="text" 
                        name="location"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-white shadow-sm"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Bio (Optional)</label>
                    <textarea 
                      rows={4}
                      name="bio"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-white shadow-sm resize-none"
                      placeholder="Write a short bio about yourself and your learning goals..."
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Column: Security & Preferences */}
            <div className="space-y-6">
              
              {/* Security Card */}
              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-purple-600">🔒</span> Security
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Password</p>
                      <p className="text-xs text-slate-500 mt-0.5">Last changed 3 months ago</p>
                    </div>
                    <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 px-3 py-1.5 bg-purple-50 rounded-lg transition-colors">
                      Update
                    </button>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">2FA Security</p>
                      <p className="text-xs text-slate-500 mt-0.5">Protect your account</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                      Disabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-purple-600">⚙️</span> Preferences
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Email Notifications</p>
                      <p className="text-xs text-slate-500 mt-0.5">Course updates & news</p>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Marketing</p>
                      <p className="text-xs text-slate-500 mt-0.5">Promotions and offers</p>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
