'use client';

import { useState } from 'react';
import { updatePartnerApplicationStatus, deletePartnerApplication } from '../../actions';
import Swal from 'sweetalert2';

interface PartnerItem {
  id: string;
  type: 'COLLEGE' | 'CHARITY';
  organizationName: string;
  category: string | null;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  website: string | null;
  city: string;
  state: string;
  studentCount: string;
  interestAreas: string | null;
  registrationNumber: string | null;
  message: string | null;
  status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
}

interface PartnershipsClientProps {
  initialApplications: PartnerItem[];
}

export default function PartnershipsClient({ initialApplications }: PartnershipsClientProps) {
  const [applications, setApplications] = useState<PartnerItem[]>(initialApplications);
  const [selectedType, setSelectedType] = useState<'ALL' | 'COLLEGE' | 'CHARITY'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalApp, setActiveModalApp] = useState<PartnerItem | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Stats calculation
  const totalCount = applications.length;
  const collegeCount = applications.filter(a => a.type === 'COLLEGE').length;
  const charityCount = applications.filter(a => a.type === 'CHARITY').length;
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  // Filtered applications
  const filtered = applications.filter(app => {
    if (selectedType !== 'ALL' && app.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && app.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrg = app.organizationName.toLowerCase().includes(q);
      const matchPerson = app.contactPerson.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchCity = app.city.toLowerCase().includes(q);
      const matchPhone = app.phone.toLowerCase().includes(q);
      if (!matchOrg && !matchPerson && !matchEmail && !matchCity && !matchPhone) return false;
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED', notes?: string) => {
    setIsUpdating(true);
    try {
      const res = await updatePartnerApplicationStatus(id, newStatus, notes);
      if (res?.error) {
        Swal.fire({ icon: 'error', title: 'Error', text: res.error });
      } else {
        setApplications(prev =>
          prev.map(item =>
            item.id === id ? { ...item, status: newStatus, adminNotes: notes !== undefined ? notes : item.adminNotes } : item
          )
        );
        if (activeModalApp && activeModalApp.id === id) {
          setActiveModalApp(prev =>
            prev ? { ...prev, status: newStatus, adminNotes: notes !== undefined ? notes : prev.adminNotes } : null
          );
        }
        Swal.fire({
          icon: 'success',
          title: `Status set to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the partnership application from "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      try {
        const res = await deletePartnerApplication(id);
        if (res?.error) {
          Swal.fire({ icon: 'error', title: 'Error', text: res.error });
        } else {
          setApplications(prev => prev.filter(a => a.id !== id));
          if (activeModalApp?.id === id) setActiveModalApp(null);
          Swal.fire({ icon: 'success', title: 'Deleted', text: 'Application removed successfully', timer: 1500, showConfirmButton: false });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete application';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    }
  };

  const openModal = (app: PartnerItem) => {
    setActiveModalApp(app);
    setNotesInput(app.adminNotes || '');
  };

  const saveAdminNotes = async () => {
    if (!activeModalApp) return;
    await handleStatusChange(activeModalApp.id, activeModalApp.status, notesInput);
  };

  return (
    <div className="space-y-8">
      {/* ── Top Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Proposals</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎓</span> College Tie-Ups
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1">{collegeCount}</div>
        </div>

        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>🌱</span> Charity Free Edu
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{charityCount}</div>
        </div>

        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>⏳</span> Pending Review
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-green-50/50 p-5 rounded-2xl border border-green-100 shadow-sm">
          <div className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>✅</span> Approved
          </div>
          <div className="text-2xl font-black text-green-900 mt-1">{approvedCount}</div>
        </div>
      </div>

      {/* ── Controls & Filter Bar ──────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        {/* Type Filter Pills & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types ({totalCount})
            </button>

            <button
              onClick={() => setSelectedType('COLLEGE')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedType === 'COLLEGE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <span>🎓</span> Colleges ({collegeCount})
            </button>

            <button
              onClick={() => setSelectedType('CHARITY')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedType === 'CHARITY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>🌱</span> Charity Trusts ({charityCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search college, person, city..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Status:</span>
          {['ALL', 'PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Applications Data Table ─────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-extrabold text-slate-500">
              <tr>
                <th className="px-6 py-4">Organization &amp; Type</th>
                <th className="px-6 py-4">Authorized Person</th>
                <th className="px-6 py-4">Location &amp; Students</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">
                    No partnership applications match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(app => {
                  const isCollege = app.type === 'COLLEGE';
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Organization & Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isCollege ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isCollege ? '🎓 College' : '🌱 Charity Trust'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm">{app.organizationName}</div>
                        {app.category && <div className="text-xs text-slate-500">{app.category}</div>}
                      </td>

                      {/* Authorized Person */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">{app.contactPerson}</div>
                        <div className="text-xs text-slate-500">{app.designation}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <a
                            href={`mailto:${app.email}`}
                            title={app.email}
                            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            ✉️ {app.email}
                          </a>
                          <a
                            href={`tel:${app.phone}`}
                            className="text-xs font-semibold text-slate-700 hover:text-orange-600 flex items-center gap-1"
                          >
                            📞 {app.phone}
                          </a>
                        </div>
                      </td>

                      {/* Location & Students */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-800">
                          📍 {app.city}, {app.state}
                        </div>
                        <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                          👥 {app.studentCount}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={app.status}
                          disabled={isUpdating}
                          onChange={e => handleStatusChange(app.id, e.target.value as 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED')}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border focus:outline-none transition-all cursor-pointer ${
                            app.status === 'APPROVED'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : app.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="PENDING">Pending Review</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="APPROVED">Approved &amp; Active</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openModal(app)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 transition-all shadow-sm"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app.id, app.organizationName)}
                          className="px-3 py-1.5 rounded-lg text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all shadow-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      {activeModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-1.5 ${
                    activeModalApp.type === 'COLLEGE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeModalApp.type === 'COLLEGE' ? '🎓 College Campus Tie-Up' : '🌱 Free Education Charity Trust'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeModalApp.organizationName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied on {new Date(activeModalApp.createdAt).toLocaleDateString()} at{' '}
                  {new Date(activeModalApp.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={() => setActiveModalApp(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              <a
                href={`tel:${activeModalApp.phone}`}
                className="px-4 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white font-bold text-xs border border-orange-200 transition-all flex items-center gap-1.5"
              >
                <span>📞 Call:</span> {activeModalApp.phone}
              </a>

              <a
                href={`https://wa.me/${activeModalApp.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-600 hover:text-white font-bold text-xs border border-green-200 transition-all flex items-center gap-1.5"
              >
                <span>💬 WhatsApp</span>
              </a>

              <a
                href={`mailto:${activeModalApp.email}`}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs border border-blue-200 transition-all flex items-center gap-1.5"
              >
                <span>✉️ Email:</span> {activeModalApp.email}
              </a>

              {activeModalApp.website && (
                <a
                  href={activeModalApp.website.startsWith('http') ? activeModalApp.website : `https://${activeModalApp.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>🌐 Website</span>
                </a>
              )}
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-6">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Contact Person:</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{activeModalApp.contactPerson}</span>
                <span className="text-slate-500">{activeModalApp.designation}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Campus / HQ Location:</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{activeModalApp.city}, {activeModalApp.state}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Student Strength:</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{activeModalApp.studentCount}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  {activeModalApp.type === 'COLLEGE' ? 'Affiliation / AISHE Code:' : 'Trust Reg # / Darpan ID:'}
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">
                  {activeModalApp.registrationNumber || 'Not specified'}
                </span>
              </div>

              {activeModalApp.category && (
                <div className="col-span-full">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Category / Stream:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{activeModalApp.category}</span>
                </div>
              )}

              {activeModalApp.interestAreas && (
                <div className="col-span-full">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Selected Training Domains:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {activeModalApp.interestAreas.split(',').map((domain, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-semibold text-[11px]">
                        {domain.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message/Proposal */}
            {activeModalApp.message && (
              <div className="mb-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block mb-1">
                  Message / Special Proposal:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeModalApp.message}
                </p>
              </div>
            )}

            {/* Admin Notes */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Internal Admin Notes / MoU Progress:
              </label>
              <textarea
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                rows={3}
                placeholder="Add notes (e.g. Spoke with TPO on 26 Oct, MoU signed for 120 CSE students, issued code GNDEC26)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={saveAdminNotes}
                disabled={isUpdating}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Save Notes
              </button>
            </div>

            {/* Status Change Bar */}
            <div className="p-4 bg-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">Quick Status Update:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeModalApp.id, 'CONTACTED', notesInput)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeModalApp.id, 'APPROVED', notesInput)}
                  className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Approve Partnership &amp; Send Email
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeModalApp.id, 'REJECTED', notesInput)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
