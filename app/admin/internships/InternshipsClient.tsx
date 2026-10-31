'use client';

import { useState } from 'react';
import { updateInternshipApplicationStatus, deleteInternshipApplication } from '../../actions';
import Swal from 'sweetalert2';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertCircle,
  Building,
  Laptop,
  Briefcase,
  Download,
} from 'lucide-react';

export interface InternshipItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  qualification: string;
  yearOfStudy: string;
  domain: string;
  duration: string;
  mode: 'CAMPUS' | 'ONLINE' | 'HYBRID';
  startDate: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  city: string | null;
  state: string | null;
  message: string | null;
  status: 'PENDING' | 'CONTACTED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
}

interface InternshipsClientProps {
  initialApplications: InternshipItem[];
}

export default function InternshipsClient({ initialApplications }: InternshipsClientProps) {
  const [applications, setApplications] = useState<InternshipItem[]>(initialApplications);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<InternshipItem | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Stats calculation
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const contactedCount = applications.filter((a) => a.status === 'CONTACTED').length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  // Filtered applications
  const filtered = applications.filter((item) => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (selectedDomain !== 'ALL' && !item.domain.toLowerCase().includes(selectedDomain.toLowerCase())) return false;
    if (selectedMode !== 'ALL' && item.mode !== selectedMode) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.fullName.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchPhone = item.phone.includes(q);
      const matchCollege = item.college.toLowerCase().includes(q);
      const matchDomain = item.domain.toLowerCase().includes(q);
      const matchCity = item.city?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchCollege || matchDomain || matchCity;
    }

    return true;
  });

  const handleOpenModal = (item: InternshipItem) => {
    setActiveModalItem(item);
    setAdminNotesDraft(item.adminNotes || '');
  };

  const handleCloseModal = () => {
    setActiveModalItem(null);
    setAdminNotesDraft('');
  };

  const handleStatusChange = async (
    id: string,
    newStatus: 'PENDING' | 'CONTACTED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED',
    notesToSave?: string
  ) => {
    setIsUpdating(true);
    try {
      const notes = notesToSave !== undefined ? notesToSave : adminNotesDraft;
      const res = await updateInternshipApplicationStatus(id, newStatus, notes);

      if (res.error) {
        Swal.fire('Error', res.error, 'error');
        return;
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus, adminNotes: notes } : app))
      );

      if (activeModalItem && activeModalItem.id === id) {
        setActiveModalItem((prev) => (prev ? { ...prev, status: newStatus, adminNotes: notes } : null));
      }

      Swal.fire({
        title: 'Status Updated!',
        text: `Application marked as ${newStatus}.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire('Error', err?.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async (id: string) => {
    if (!activeModalItem) return;
    setIsUpdating(true);
    try {
      const res = await updateInternshipApplicationStatus(id, activeModalItem.status, adminNotesDraft);
      if (res.error) {
        Swal.fire('Error', res.error, 'error');
        return;
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, adminNotes: adminNotesDraft } : app))
      );

      setActiveModalItem((prev) => (prev ? { ...prev, adminNotes: adminNotesDraft } : null));

      Swal.fire({
        title: 'Notes Saved!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire('Error', err?.message || 'Failed to save notes', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = await Swal.fire({
      title: 'Delete Application?',
      text: `Are you sure you want to permanently delete application for ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Delete',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteInternshipApplication(id);
      if (res.error) {
        Swal.fire('Error', res.error, 'error');
        return;
      }

      setApplications((prev) => prev.filter((app) => app.id !== id));
      if (activeModalItem?.id === id) {
        handleCloseModal();
      }

      Swal.fire('Deleted', 'Application removed successfully', 'success');
    } catch (err: any) {
      Swal.fire('Error', err?.message || 'Failed to delete application', 'error');
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      Swal.fire('No Data', 'There are no applications to export.', 'info');
      return;
    }

    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'College',
      'Qualification',
      'Year of Study',
      'Domain',
      'Duration',
      'Mode',
      'City',
      'Start Date',
      'Status',
      'Resume URL',
      'Created At',
      'Notes',
    ];

    const rows = filtered.map((item) => [
      `"${item.id}"`,
      `"${item.fullName.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${item.phone.replace(/"/g, '""')}"`,
      `"${item.college.replace(/"/g, '""')}"`,
      `"${item.qualification.replace(/"/g, '""')}"`,
      `"${item.yearOfStudy.replace(/"/g, '""')}"`,
      `"${item.domain.replace(/"/g, '""')}"`,
      `"${item.duration.replace(/"/g, '""')}"`,
      `"${item.mode}"`,
      `"${(item.city || '').replace(/"/g, '""')}"`,
      `"${(item.startDate || '').replace(/"/g, '""')}"`,
      `"${item.status}"`,
      `"${(item.resumeUrl || '').replace(/"/g, '""')}"`,
      `"${item.createdAt}"`,
      `"${(item.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flymedia-internships-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending Review
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <Phone className="w-3 h-3 text-blue-500" />
            Contacted
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 text-purple-500" />
            Shortlisted
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Accepted / Enrolled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Rejected
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= STATS OVERVIEW CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedStatus('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Total</span>
            <GraduationCap className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black">{totalCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus('PENDING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black">{pendingCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus('CONTACTED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'CONTACTED'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Contacted</span>
            <Phone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black">{contactedCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus('ACCEPTED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'ACCEPTED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black">{shortlistedCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus('REJECTED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'REJECTED'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black">{rejectedCount}</div>
        </div>
      </div>

      {/* ================= CONTROLS & FILTERS ================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, phone, college, city..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Domains</option>
            <option value="Web Development">Web Development</option>
            <option value="Python">Python &amp; AI</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Graphic Designing">Graphic Design / UI/UX</option>
            <option value="Video Editing">Video Editing</option>
            <option value="Mobile App">Mobile App</option>
          </select>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Modes</option>
            <option value="CAMPUS">🏫 Campus</option>
            <option value="ONLINE">🌐 Online</option>
            <option value="HYBRID">⚡ Hybrid</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= APPLICATIONS TABLE ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-black tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">College &amp; Degree</th>
                <th className="px-6 py-4">Domain &amp; Duration</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold text-sm">
                    No internship applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{item.fullName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-bold text-rose-600 text-[10px] uppercase">{item.mode}</span>
                      </div>
                    </td>

                    {/* College & Degree */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={item.college}>
                          {item.college}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.qualification} • <span className="font-semibold text-slate-700">{item.yearOfStudy}</span>
                      </div>
                    </td>

                    {/* Domain & Duration */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-orange-600 text-xs">{item.domain}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        ⏱️ {item.duration}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <a
                          href={`tel:${item.phone}`}
                          className="hover:text-orange-600 transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{item.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hi ${item.fullName}, this is Flymedia Technology admissions team regarding your ${item.domain} internship application.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-black transition-colors"
                          title="Chat on WhatsApp"
                        >
                          WhatsApp
                        </a>
                      </div>
                      <a
                        href={`mailto:${item.email}`}
                        className="text-[11px] text-slate-500 hover:text-slate-900 block truncate max-w-[180px] mt-0.5"
                      >
                        {item.email}
                      </a>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 rounded-xl transition-all cursor-pointer"
                          title="View Application Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.fullName)}
                          className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-all cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DETAIL & STATUS MODAL ================= */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {activeModalItem.domain}
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">{activeModalItem.fullName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applied on {new Date(activeModalItem.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
              {/* Quick Communication Bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <a
                  href={`tel:${activeModalItem.phone}`}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call {activeModalItem.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${activeModalItem.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hi ${activeModalItem.fullName}, this is Flymedia Technology admissions team regarding your ${activeModalItem.domain} internship application.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                </a>
                <a
                  href={`mailto:${activeModalItem.email}`}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>Send Email</span>
                </a>
              </div>

              {/* Status Selector */}
              <div className="p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl space-y-2">
                <label className="text-xs font-black uppercase text-orange-900 tracking-wider">
                  Update Application Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'CONTACTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(activeModalItem.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        activeModalItem.status === st
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">College / University</span>
                  <div className="font-extrabold text-slate-900">{activeModalItem.college}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Degree &amp; Year</span>
                  <div className="font-extrabold text-slate-900">
                    {activeModalItem.qualification} • {activeModalItem.yearOfStudy}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Duration &amp; Mode</span>
                  <div className="font-extrabold text-slate-900">
                    {activeModalItem.duration} ({activeModalItem.mode})
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Location &amp; Start Date</span>
                  <div className="font-extrabold text-slate-900">
                    {activeModalItem.city || 'Not specified'} • {activeModalItem.startDate || 'Immediate'}
                  </div>
                </div>
              </div>

              {/* Links (Resume / Portfolio) */}
              {(activeModalItem.resumeUrl || activeModalItem.portfolioUrl) && (
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Applicant Links</span>
                  <div className="flex flex-wrap gap-3">
                    {activeModalItem.resumeUrl && (
                      <a
                        href={activeModalItem.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Resume / CV Link</span>
                      </a>
                    )}
                    {activeModalItem.portfolioUrl && (
                      <a
                        href={activeModalItem.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Portfolio / GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Message from student */}
              {activeModalItem.message && (
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Applicant Goals / Notes</span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">&ldquo;{activeModalItem.message}&rdquo;</p>
                </div>
              )}

              {/* Admin Internal Notes Draft */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                  <span>Internal Admin Notes</span>
                  <span className="text-[11px] font-semibold text-slate-400">Only visible to administrators</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNotesDraft}
                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                  placeholder="e.g. Called student on Oct 31, interested in 6 Months MERN batch starting Monday, send syllabus on WhatsApp..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
                />
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSaveNotes(activeModalItem.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleDelete(activeModalItem.id, activeModalItem.fullName)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Application</span>
              </button>

              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

