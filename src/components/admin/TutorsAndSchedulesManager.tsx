'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import {
  adminCreateTutor,
  adminUpdateTutor,
  adminDeleteTutor,
  adminGenerateClassSchedule,
  adminDeleteSchedule,
  adminDeleteLiveClass,
} from '../../../app/actions';

interface PackageItem {
  id: string;
  title: string;
  category: string;
  slug: string;
  totalClasses?: number;
}

interface TutorItem {
  id: string;
  name: string | null;
  email: string;
  professionTitle: string | null;
  bio: string | null;
  avatar: string | null;
  assignedPackages?: PackageItem[];
}

interface ScheduleItem {
  id: string;
  packageId: string;
  tutorId: string;
  daysOfWeek: string[];
  startTime: string;
  duration: number;
  meetLink: string;
  startDate: string;
  totalClasses: number;
  status: string;
  createdAt: string;
  package?: PackageItem;
  tutor?: TutorItem;
  liveClasses?: any[];
}

interface LiveClassItem {
  id: string;
  packageId: string;
  tutorId: string;
  scheduleId?: string | null;
  classNumber?: number | null;
  title: string;
  meetLink: string;
  startTime: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  package?: PackageItem;
  tutor?: TutorItem;
}

export default function TutorsAndSchedulesManager({
  initialTutors,
  packages,
  initialSchedules,
  initialLiveClasses,
}: {
  initialTutors: TutorItem[];
  packages: PackageItem[];
  initialSchedules: ScheduleItem[];
  initialLiveClasses: LiveClassItem[];
}) {
  const [activeTab, setActiveTab] = useState<'tutors' | 'schedule' | 'classes'>('tutors');
  
  // Tutors state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<TutorItem | null>(null);
  const [tutorPending, setTutorPending] = useState(false);

  // Schedule generator state
  const [selectedTutorId, setSelectedTutorId] = useState<string>(initialTutors[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday']);
  const [startTime, setStartTime] = useState<string>('18:00');
  const [duration, setDuration] = useState<number>(60);
  const [meetLink, setMeetLink] = useState<string>('https://meet.google.com/');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [totalClasses, setTotalClasses] = useState<number>(12);
  const [schedulePending, setSchedulePending] = useState(false);

  // Weekdays list
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Handle Add Tutor Submit
  const handleAddTutorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTutorPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await adminCreateTutor(null, formData);
    setTutorPending(false);

    if (res?.error) {
      Swal.fire('Error', res.error, 'error');
    } else {
      Swal.fire('Success!', res?.message || 'Tutor created successfully.', 'success');
      setIsAddModalOpen(false);
    }
  };

  // Handle Edit Tutor Submit
  const handleEditTutorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTutorPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await adminUpdateTutor(null, formData);
    setTutorPending(false);

    if (res?.error) {
      Swal.fire('Error', res.error, 'error');
    } else {
      Swal.fire('Updated!', res?.message || 'Tutor updated successfully.', 'success');
      setEditingTutor(null);
    }
  };

  // Handle Delete Tutor
  const handleDeleteTutor = (tutor: TutorItem) => {
    Swal.fire({
      title: 'Delete Tutor?',
      text: `Are you sure you want to delete ${tutor.name || tutor.email}? All their package assignments will be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Tutor',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await adminDeleteTutor(tutor.id);
        if (res?.error) {
          Swal.fire('Error', res.error, 'error');
        } else {
          Swal.fire('Deleted!', 'Tutor removed successfully.', 'success');
        }
      }
    });
  };

  // Handle Schedule Generator Submit
  const handleGenerateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTutorId || !selectedPackageId) {
      Swal.fire('Missing Information', 'Please select a tutor and a package.', 'warning');
      return;
    }
    if (selectedDays.length === 0) {
      Swal.fire('Missing Information', 'Please select at least 1 day per week.', 'warning');
      return;
    }
    if (!meetLink || !meetLink.trim()) {
      Swal.fire('Missing Information', 'Please provide a valid Google Meet link.', 'warning');
      return;
    }

    setSchedulePending(true);
    const formData = new FormData();
    formData.append('tutorId', selectedTutorId);
    formData.append('packageId', selectedPackageId);
    selectedDays.forEach((day) => formData.append('daysOfWeek', day));
    formData.append('startTime', startTime);
    formData.append('duration', duration.toString());
    formData.append('meetLink', meetLink);
    formData.append('startDate', startDate);
    formData.append('totalClasses', totalClasses.toString());

    const res = await adminGenerateClassSchedule(null, formData);
    setSchedulePending(false);

    if (res?.error) {
      Swal.fire('Error', res.error, 'error');
    } else {
      Swal.fire({
        title: 'Schedule Generated!',
        text: res?.message || `Successfully generated ${totalClasses} classes.`,
        icon: 'success',
      });
      setActiveTab('classes');
    }
  };

  // Handle Delete Schedule
  const handleDeleteSchedule = (scheduleId: string) => {
    Swal.fire({
      title: 'Delete Schedule?',
      text: 'This will cancel the recurring rule and all upcoming scheduled classes created from it.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Schedule',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await adminDeleteSchedule(scheduleId);
        if (res?.error) {
          Swal.fire('Error', res.error, 'error');
        } else {
          Swal.fire('Deleted!', 'Schedule cancelled.', 'success');
        }
      }
    });
  };

  // Handle Delete Live Class
  const handleDeleteClass = (classId: string, title: string) => {
    Swal.fire({
      title: 'Delete Class?',
      text: `Are you sure you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await adminDeleteLiveClass(classId);
        if (res?.error) {
          Swal.fire('Error', res.error, 'error');
        } else {
          Swal.fire('Deleted!', 'Class removed.', 'success');
        }
      }
    });
  };

  // Find currently selected tutor's packages
  const activeTutor = initialTutors.find((t) => t.id === selectedTutorId);
  const tutorPackages = activeTutor?.assignedPackages || [];

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('tutors')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'tutors'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧑‍🏫 Tutors & Assigned Packages ({initialTutors.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'schedule'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 Recurring Schedule Generator
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'classes'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏰ Scheduled Classes ({initialLiveClasses.length})
          </button>
        </div>

        {activeTab === 'tutors' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Tutor
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TUTORS LIST & PACKAGE ASSIGNMENTS                      */}
      {/* ============================================================== */}
      {activeTab === 'tutors' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-bold text-amber-900 mb-0.5">Multi-Package Tutor Assignments:</p>
              <p>
                Each tutor can be assigned to multiple packages (e.g. Web Development, Video Editing, etc.).
                When scheduling classes, the admin can select the tutor and schedule their regular recurring sessions.
              </p>
            </div>
          </div>

          {initialTutors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🧑‍🏫
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Tutors Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Add your instructors and assign them to packages like Web Development or Video Editing.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                + Add First Tutor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialTutors.map((tutor) => {
                const assigned = tutor.assignedPackages || [];
                return (
                  <div
                    key={tutor.id}
                    className="bg-white border border-slate-200 hover:border-orange-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Tutor Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                            {tutor.name ? tutor.name.slice(0, 2).toUpperCase() : 'TR'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 leading-tight">
                              {tutor.name || 'Unnamed Tutor'}
                            </h3>
                            <p className="text-xs text-slate-500">{tutor.email}</p>
                            <span className="inline-block mt-1 text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                              {tutor.professionTitle || 'Instructor'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {tutor.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {tutor.bio}
                        </p>
                      )}

                      {/* Assigned Packages */}
                      <div className="space-y-1.5 mb-6">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Assigned Packages ({assigned.length})</span>
                        </div>
                        {assigned.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No packages assigned yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assigned.map((pkg) => (
                              <span
                                key={pkg.id}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80"
                              >
                                🎓 {pkg.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedTutorId(tutor.id);
                          if (assigned.length > 0) {
                            setSelectedPackageId(assigned[0].id);
                          }
                          setActiveTab('schedule');
                        }}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        📅 Schedule Classes
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingTutor(tutor)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Tutor & Packages"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTutor(tutor)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Tutor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RECURRING SCHEDULE GENERATOR                           */}
      {/* ============================================================== */}
      {activeTab === 'schedule' && (
        <div className="max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Generate Tutor Class Schedule</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the tutor, assign the package, choose recurrence days (e.g. single day a week or twice a week),
              and provide the Google Meet link. The system will create all 12 classes automatically.
            </p>
          </div>

          {/* Workflow Notice */}
          <div className="bg-orange-50/70 border border-orange-200/60 rounded-2xl p-4 text-xs text-orange-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-orange-900">
              <span>📌</span> 12-Class Package Rule:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>Students purchase a package with <strong>{totalClasses} classes</strong>.</li>
              <li>Classes will be scheduled on the days selected below (e.g. every Tuesday & Thursday at 6:00 PM).</li>
              <li>Students click the Meet link to join. If a student is absent, they lose that class.</li>
              <li>Once all {totalClasses} classes are completed, the student package is automatically expired.</li>
            </ul>
          </div>

          <form onSubmit={handleGenerateSchedule} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Select Tutor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Select Tutor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => {
                    const tutorId = e.target.value;
                    setSelectedTutorId(tutorId);
                    const tut = initialTutors.find((t) => t.id === tutorId);
                    if (tut?.assignedPackages && tut.assignedPackages.length > 0) {
                      setSelectedPackageId(tut.assignedPackages[0].id);
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                >
                  {initialTutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name || tutor.email} ({tutor.professionTitle || 'Tutor'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Package */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Select Package to Schedule <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                >
                  {packages.map((pkg) => {
                    const isAssigned = tutorPackages.some((tp) => tp.id === pkg.id);
                    return (
                      <option key={pkg.id} value={pkg.id}>
                        {isAssigned ? '★ [Assigned] ' : ''}
                        {pkg.title} ({pkg.totalClasses || 12} Classes)
                      </option>
                    );
                  })}
                </select>
                {tutorPackages.length > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Starred (★) packages are officially assigned to this tutor.
                  </p>
                )}
              </div>
            </div>

            {/* Recurrence Days */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                3. Recurrence Days of the Week <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Select single day (e.g. Sunday only for weekend batch) or multiple days (e.g. Mon, Wed, Fri for regular batch).
              </p>
              <div className="flex flex-wrap gap-2">
                {daysList.map((day) => {
                  const isChecked = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isChecked
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-semibold text-orange-600 mt-2">
                Selected: {selectedDays.join(', ')} ({selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} per week)
              </p>
            </div>

            {/* Time & Duration & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. Class Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Batch Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Meet Link & Total Classes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  5. Google Meet Link for Students <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">Students will join live classes using this link.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Classes to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white font-bold text-orange-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={schedulePending}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:via-red-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {schedulePending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating Schedule...
                  </>
                ) : (
                  <>
                    📅 Generate & Schedule {totalClasses} Classes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SCHEDULED LIVE CLASSES & RECURRING RULES               */}
      {/* ============================================================== */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Active Recurring Rules */}
          {initialSchedules.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Active Recurring Schedule Rules ({initialSchedules.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialSchedules.map((sch) => (
                  <div key={sch.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">{sch.package?.title || 'Package'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                          {sch.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">
                        Instructor: <strong className="text-slate-700">{sch.tutor?.name || sch.tutor?.email || 'Tutor'}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mb-1">
                        Days: <strong className="text-orange-600">{Array.isArray(sch.daysOfWeek) ? sch.daysOfWeek.join(', ') : sch.daysOfWeek}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        Time: {sch.startTime} ({sch.duration} min) • Total {sch.totalClasses} classes
                      </p>
                      <a
                        href={sch.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 line-clamp-1 mb-3"
                      >
                        🔗 {sch.meetLink}
                      </a>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end">
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Cancel Schedule Rule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Live Classes List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">All Scheduled Live Classes ({initialLiveClasses.length})</h3>
                <p className="text-xs text-slate-500">
                  Track individual class sessions, meet links, and completion statuses.
                </p>
              </div>
            </div>

            {initialLiveClasses.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No scheduled live classes found. Use the Schedule Generator to schedule classes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Class #</th>
                      <th className="py-3 px-3">Class Title & Package</th>
                      <th className="py-3 px-3">Tutor</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Meet Link</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {initialLiveClasses.map((lc) => {
                      const classTime = new Date(lc.startTime);
                      const isPast = classTime.getTime() + (lc.duration * 60000) < Date.now();

                      return (
                        <tr key={lc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                              {lc.classNumber ? `#${lc.classNumber}` : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{lc.title}</p>
                            <p className="text-[11px] text-slate-500">{lc.package?.title}</p>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            {lc.tutor?.name || lc.tutor?.email || 'Assigned Tutor'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900">
                              {classTime.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {classTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({lc.duration} mins)
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <a
                              href={lc.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg transition-colors"
                            >
                              📹 Join Meet
                            </a>
                          </td>
                          <td className="py-3 px-3">
                            {isPast ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                CONDUCTED (PASSED)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                                UPCOMING
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteClass(lc.id, lc.title)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Class"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD NEW TUTOR                                          */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Tutor</h3>
                <p className="text-xs text-slate-500">Create tutor account and assign to packages.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTutorSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tutor@flymedia.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profession / Title</label>
                <input
                  name="professionTitle"
                  type="text"
                  placeholder="e.g. Senior Full-Stack Developer & Mentor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Info</label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="Tell students about the tutor's experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              {/* Multi-package Assignment */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Assign to Multiple Packages (e.g. Web Dev, Video Editing, etc.)
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Check all packages that this tutor is assigned to teach:
                </p>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {packages.map((pkg) => (
                    <label
                      key={pkg.id}
                      className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/80 hover:border-orange-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="packageIds"
                        value={pkg.id}
                        className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{pkg.title}</p>
                        <p className="text-[10px] text-slate-500">{pkg.category} • {pkg.totalClasses || 12} classes</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tutorPending}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {tutorPending ? 'Creating Tutor...' : 'Save & Assign Tutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT TUTOR & ASSIGNED PACKAGES                         */}
      {/* ============================================================== */}
      {editingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Tutor & Package Assignments</h3>
                <p className="text-xs text-slate-500">Update instructor details and assigned packages.</p>
              </div>
              <button
                onClick={() => setEditingTutor(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditTutorSubmit} className="p-6 overflow-y-auto space-y-4">
              <input type="hidden" name="tutorId" value={editingTutor.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingTutor.name || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingTutor.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Leave blank to keep)</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profession / Title</label>
                <input
                  name="professionTitle"
                  type="text"
                  defaultValue={editingTutor.professionTitle || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Info</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingTutor.bio || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                />
              </div>

              {/* Multi-package Assignment */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Assigned Packages
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Check all packages that this tutor is assigned to teach:
                </p>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {packages.map((pkg) => {
                    const isChecked = editingTutor.assignedPackages?.some((ap) => ap.id === pkg.id);
                    return (
                      <label
                        key={pkg.id}
                        className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/80 hover:border-orange-300 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          name="packageIds"
                          value={pkg.id}
                          defaultChecked={isChecked}
                          className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{pkg.title}</p>
                          <p className="text-[10px] text-slate-500">{pkg.category} • {pkg.totalClasses || 12} classes</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTutor(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tutorPending}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {tutorPending ? 'Saving...' : 'Update Tutor & Packages'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
