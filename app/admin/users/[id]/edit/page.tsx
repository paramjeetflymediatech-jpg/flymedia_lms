import { requireAdmin } from '../../../../../src/lib/auth';
import { User } from '../../../../../src/db/models';
import { adminUpdateUser } from '../../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const userData = await User.findByPk(id);

  if (!userData) {
    redirect('/admin/users');
  }

  const user = userData.toJSON() as any;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit User</h1>
          <p className="text-sm text-slate-500">Update details for {user.name || user.email}</p>
        </div>
        <Link href={`/admin/users/${user.id}`} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to User
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        <form action={async (formData) => {
          'use server';
          const res = await adminUpdateUser(user.id, formData);
          if (res?.success) {
            redirect(`/admin/users/${user.id}`);
          } else {
            // In a real app we'd show an error, but simple redirect for now
            console.error(res?.error);
          }
        }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              <select
                name="role"
                defaultValue={user.role}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              >
                <option value="STUDENT">Student</option>
                <option value="TUTOR">Tutor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password (leave blank to keep current)</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>

            {/* General Fields */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={user.bio || ''}
                placeholder="Brief biography..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>

            {/* Tutor Specific Fields */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Tutor Profile Settings <span className="text-xs font-normal text-slate-500">(Only applies if Role is Tutor)</span></h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Profession / Title</label>
                  <input
                    name="professionTitle"
                    type="text"
                    defaultValue={user.professionTitle || ''}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skills (Comma separated)</label>
                  <input
                    name="skills"
                    type="text"
                    defaultValue={user.skills ? (user.skills as string[]).join(', ') : ''}
                    placeholder="e.g. React, Next.js, System Design"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rating</label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    defaultValue={user.rating || 5.0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reviews Count</label>
                  <input
                    name="reviewsCount"
                    type="number"
                    min="0"
                    defaultValue={user.reviewsCount || 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Students Mentored</label>
                  <input
                    name="studentsMentored"
                    type="number"
                    min="0"
                    defaultValue={user.studentsMentored || 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Student Specific Fields */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Student Background & Dossier <span className="text-xs font-normal text-slate-500">(Only applies if Role is Student)</span></h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      name="phone"
                      type="text"
                      defaultValue={user.phone || ''}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Social Category</label>
                    <select
                      name="studentCategory"
                      defaultValue={user.studentCategory || 'General'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Education */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-800">Education Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Highest Qualification</label>
                      <input
                        name="highestQualification"
                        type="text"
                        defaultValue={user.educationDetails?.highestQualification || ''}
                        placeholder="e.g. 12th / BCA / B.Tech"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">College / School</label>
                      <input
                        name="collegeOrSchool"
                        type="text"
                        defaultValue={user.educationDetails?.collegeOrSchool || ''}
                        placeholder="School or College name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passing Year</label>
                      <input
                        name="passingYear"
                        type="text"
                        defaultValue={user.educationDetails?.passingYear || ''}
                        placeholder="2023"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marks / CGPA</label>
                      <input
                        name="percentageOrCgpa"
                        type="text"
                        defaultValue={user.educationDetails?.percentageOrCgpa || ''}
                        placeholder="85% or 8.5 CGPA"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      name="currentlyStudying"
                      id="currentlyStudying"
                      defaultChecked={Boolean(user.educationDetails?.currentlyStudying)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="currentlyStudying" className="text-xs font-medium text-slate-700">Currently studying / pursuing higher education</label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Course</label>
                      <input
                        name="currentCourse"
                        type="text"
                        defaultValue={user.educationDetails?.currentCourse || ''}
                        placeholder="e.g. BCA 3rd Sem"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Institution</label>
                      <input
                        name="currentInstitution"
                        type="text"
                        defaultValue={user.educationDetails?.currentInstitution || ''}
                        placeholder="University name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-800">Address Details</p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Street Address</label>
                    <input
                      name="addressLine"
                      type="text"
                      defaultValue={user.addressDetails?.addressLine || ''}
                      placeholder="House / Street address"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                      <input
                        name="city"
                        type="text"
                        defaultValue={user.addressDetails?.city || ''}
                        placeholder="City"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
                      <input
                        name="state"
                        type="text"
                        defaultValue={user.addressDetails?.state || ''}
                        placeholder="State"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">PIN Code</label>
                      <input
                        name="pincode"
                        type="text"
                        defaultValue={user.addressDetails?.pincode || ''}
                        placeholder="PIN code"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Family */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-800">Family & Guardian</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Father's Name</label>
                      <input
                        name="fatherName"
                        type="text"
                        defaultValue={user.familyDetails?.fatherName || ''}
                        placeholder="Father's name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mother's Name</label>
                      <input
                        name="motherName"
                        type="text"
                        defaultValue={user.familyDetails?.motherName || ''}
                        placeholder="Mother's name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Guardian Phone</label>
                      <input
                        name="guardianPhone"
                        type="text"
                        defaultValue={user.familyDetails?.guardianPhone || ''}
                        placeholder="Parent contact number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Family Occupation</label>
                      <input
                        name="familyOccupation"
                        type="text"
                        defaultValue={user.familyDetails?.familyOccupation || ''}
                        placeholder="Occupation"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Annual Household Income</label>
                      <input
                        name="annualIncome"
                        type="text"
                        defaultValue={user.familyDetails?.annualIncome || ''}
                        placeholder="e.g. ₹2.5 - ₹5 Lakhs"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
