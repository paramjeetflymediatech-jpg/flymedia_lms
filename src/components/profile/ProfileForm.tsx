"use client";

import { useState, useTransition } from 'react';
import Swal from 'sweetalert2';

interface ProfileFormProps {
  user: any;
  updateAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export default function ProfileForm({ user, updateAction }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create initials for avatar fallback
  const initials = user.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'ST';

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateAction(formData);
      if (result.error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: result.error,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Profile updated successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        setIsEditing(false);
      }
    });
  };

  const [currentlyStudying, setCurrentlyStudying] = useState<boolean>(
    Boolean(user.educationDetails?.currentlyStudying)
  );

  return (
    <form action={handleAction} className="px-6 sm:px-10 pb-10">
      
      {/* Avatar & Title */}
      <div className="relative flex justify-between items-end pt-6 md:pt-10 mb-8">
        <div className="flex items-end gap-6">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-md relative overflow-hidden ${isEditing ? 'group' : ''}`}>
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl md:text-5xl font-bold text-orange-600">
                {initials}
              </div>
            )}
            
            {isEditing && (
              <>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold backdrop-blur-sm pointer-events-none">
                  Change Photo
                </div>
                <input 
                  type="file" 
                  name="avatar" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  title="Upload new avatar"
                />
              </>
            )}
          </div>
          <div className="mb-2 md:mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{user.name || 'Student Name'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
              {user.studentCategory && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                  {user.studentCategory} Category
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div className="hidden sm:flex gap-3 mb-2">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-70"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="hidden sm:inline-flex px-6 py-2.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-colors shadow-sm mb-2"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Section 1: Basic & Contact Info */}
        <div className="border border-slate-100 rounded-2xl p-6 md:p-8 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-orange-600">👤</span> Personal & Contact Information
          </h3>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  defaultValue={user.name || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user.email} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-slate-100 text-slate-500 shadow-sm opacity-70 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed directly.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mobile / WhatsApp Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  defaultValue={user.phone || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Social Category</label>
                <select
                  name="studentCategory"
                  defaultValue={user.studentCategory || 'General'}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Bio & Goals</label>
              <textarea 
                rows={3}
                name="bio"
                defaultValue={user.bio || ''}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm resize-none transition-colors
                  ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                placeholder="Write a short bio about yourself and your learning goals..."
              ></textarea>
            </div>

            {user.role === 'TUTOR' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">What to expect in our Trial Call (One point per line)</label>
                <textarea 
                  rows={4}
                  name="trialExpectations"
                  defaultValue={user.trialExpectations ? user.trialExpectations.join('\n') : ''}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm resize-none transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="Enter expectations, one on each line..."
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Education Background Details */}
        <div className="border border-slate-100 rounded-2xl p-6 md:p-8 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-orange-600">🎓</span> Education Background & Past Studies
          </h3>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Highest Past Qualification</label>
                <select
                  name="highestQualification"
                  defaultValue={user.educationDetails?.highestQualification || '12th Standard'}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="10th Standard">10th Standard (High School)</option>
                  <option value="12th Standard">12th Standard (Senior Secondary)</option>
                  <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                  <option value="Graduation (BCA/B.Tech/B.Sc/BA/B.Com)">Graduation (BCA/B.Tech/B.Sc/BA/B.Com)</option>
                  <option value="Post Graduation (MCA/M.Tech/M.Sc/MBA)">Post Graduation (MCA/M.Tech/M.Sc/MBA)</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">College / School / Board</label>
                <input 
                  type="text" 
                  name="collegeOrSchool"
                  defaultValue={user.educationDetails?.collegeOrSchool || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. Delhi Public School / Punjab University"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Passing Year</label>
                <input 
                  type="text" 
                  name="passingYear"
                  defaultValue={user.educationDetails?.passingYear || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. 2023"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Marks Percentage or CGPA</label>
                <input 
                  type="text" 
                  name="percentageOrCgpa"
                  defaultValue={user.educationDetails?.percentageOrCgpa || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. 84.5% or 8.2 CGPA"
                />
              </div>
            </div>

            {/* Currently Studying Toggle */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Are you currently studying / enrolled in a degree or diploma?</p>
                  <p className="text-xs text-slate-500">Helps us customize batch timings and scholarship eligibility.</p>
                </div>
                <input 
                  type="hidden" 
                  name="currentlyStudying" 
                  value={currentlyStudying ? 'true' : 'false'} 
                />
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => isEditing && setCurrentlyStudying(!currentlyStudying)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    currentlyStudying ? 'bg-orange-600' : 'bg-slate-300'
                  } ${!isEditing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentlyStudying ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {currentlyStudying && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Current Course / Degree</label>
                    <input 
                      type="text" 
                      name="currentCourse"
                      defaultValue={user.educationDetails?.currentCourse || ''} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                        ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. BCA 2nd Year / B.Tech CS 4th Sem"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Current College / University</label>
                    <input 
                      type="text" 
                      name="currentInstitution"
                      defaultValue={user.educationDetails?.currentInstitution || ''} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                        ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                      placeholder="e.g. Chandigarh University"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Address Details */}
        <div className="border border-slate-100 rounded-2xl p-6 md:p-8 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-orange-600">📍</span> Address & Residence Details
          </h3>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Street / Flat / House Address</label>
              <input 
                type="text" 
                name="addressLine"
                defaultValue={user.addressDetails?.addressLine || ''} 
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                  ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                placeholder="e.g. #142, Street 4, Sector 70"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">City / District</label>
                <input 
                  type="text" 
                  name="city"
                  defaultValue={user.addressDetails?.city || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. Mohali"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">State</label>
                <input 
                  type="text" 
                  name="state"
                  defaultValue={user.addressDetails?.state || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. Punjab"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">PIN Code</label>
                <input 
                  type="text" 
                  name="pincode"
                  defaultValue={user.addressDetails?.pincode || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. 160071"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Family Information */}
        <div className="border border-slate-100 rounded-2xl p-6 md:p-8 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-orange-600">👨‍👩‍👧</span> Family & Guardian Information
          </h3>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Father's Name</label>
                <input 
                  type="text" 
                  name="fatherName"
                  defaultValue={user.familyDetails?.fatherName || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="Father's full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mother's Name</label>
                <input 
                  type="text" 
                  name="motherName"
                  defaultValue={user.familyDetails?.motherName || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="Mother's full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Parent / Guardian Contact</label>
                <input 
                  type="tel" 
                  name="guardianPhone"
                  defaultValue={user.familyDetails?.guardianPhone || ''} 
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="e.g. +91 98123 45678"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Family Occupation</label>
                <select
                  name="familyOccupation"
                  defaultValue={user.familyDetails?.familyOccupation || 'Salaried / Private Job'}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="Salaried / Private Job">Salaried / Private Job</option>
                  <option value="Government Employee">Government Employee</option>
                  <option value="Business / Merchant">Business / Merchant</option>
                  <option value="Agriculture / Farming">Agriculture / Farming</option>
                  <option value="Self Employed / Professional">Self Employed / Professional</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Annual Household Income</label>
                <select
                  name="annualIncome"
                  defaultValue={user.familyDetails?.annualIncome || 'Below ₹2.5 Lakhs'}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm transition-colors
                    ${!isEditing ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="Below ₹2.5 Lakhs">Below ₹2.5 Lakhs</option>
                  <option value="₹2.5 Lakhs - ₹5 Lakhs">₹2.5 Lakhs - ₹5 Lakhs</option>
                  <option value="₹5 Lakhs - ₹10 Lakhs">₹5 Lakhs - ₹10 Lakhs</option>
                  <option value="Above ₹10 Lakhs">Above ₹10 Lakhs</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="pt-4 flex justify-end sm:hidden">
          {isEditing ? (
            <div className="flex flex-col w-full gap-3">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-sm disabled:opacity-70"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="w-full px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
