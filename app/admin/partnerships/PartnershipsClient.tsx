'use client';

import { useState } from 'react';
import { updatePartnerApplicationStatus, deletePartnerApplication } from '../../actions';
import Swal from 'sweetalert2';
import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Eye,
  Trash2,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Globe,
  FileText,
  AlertCircle,
  Check,
  Award,
} from 'lucide-react';

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

  const handleStatusChange = async (
    id: string,
    newStatus: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED',
    notes?: string
  ) => {
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
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Application removed successfully',
            timer: 1500,
            showConfirmButton: false,
          });
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

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Proposals */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Proposals</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Colleges */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">College Tie-Ups</div>
            <div className="text-2xl font-black text-indigo-950 mt-1">{collegeCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Charities */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Charity Free Edu</div>
            <div className="text-2xl font-black text-emerald-950 mt-1">{charityCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-black text-amber-950 mt-1">{pendingCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Approved */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Approved Active</div>
            <div className="text-2xl font-black text-teal-950 mt-1">{approvedCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Segmented Type Switcher */}
          <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 max-w-fit">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Types</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedType('COLLEGE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedType === 'COLLEGE'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Colleges</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700">
                {collegeCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedType('CHARITY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedType === 'CHARITY'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>Charity Trusts</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                {charityCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by college, person, city..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>

          {[
            { id: 'ALL', label: 'All Status', dotColor: 'bg-slate-400' },
            { id: 'PENDING', label: 'Pending Review', dotColor: 'bg-amber-500' },
            { id: 'CONTACTED', label: 'Contacted', dotColor: 'bg-blue-500' },
            { id: 'APPROVED', label: 'Approved', dotColor: 'bg-emerald-500' },
            { id: 'REJECTED', label: 'Rejected', dotColor: 'bg-rose-500' },
          ].map(st => {
            const isActive = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : st.dotColor}`} />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Applications Data Table ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Organization &amp; Type</th>
                <th className="px-5 py-3.5">Authorized Person</th>
                <th className="px-5 py-3.5">Location &amp; Scale</th>
                <th className="px-5 py-3.5">Application Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No applications found</p>
                      <p className="text-xs text-slate-400">
                        No partnership applications match your current filters or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(app => {
                  const isCollege = app.type === 'COLLEGE';

                  // Dynamic status pill styling
                  const statusConfig = {
                    PENDING: {
                      badge: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300',
                      dot: 'bg-amber-500',
                      label: 'Pending Review',
                    },
                    CONTACTED: {
                      badge: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
                      dot: 'bg-blue-500',
                      label: 'Contacted',
                    },
                    APPROVED: {
                      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300',
                      dot: 'bg-emerald-500',
                      label: 'Approved',
                    },
                    REJECTED: {
                      badge: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300',
                      dot: 'bg-rose-500',
                      label: 'Rejected',
                    },
                  }[app.status];

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Organization & Type */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start gap-3">
                          {/* Institution Squircle Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                              isCollege
                                ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                            }`}
                          >
                            {isCollege ? <GraduationCap className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                                  isCollege ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {isCollege ? 'College Tie-Up' : 'Charity Trust'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(app.createdAt)}
                              </span>
                            </div>

                            <div
                              onClick={() => openModal(app)}
                              className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors cursor-pointer truncate"
                            >
                              {app.organizationName}
                            </div>

                            {app.category && (
                              <div className="text-xs text-slate-500 line-clamp-1">{app.category}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Authorized Person */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">{app.contactPerson}</div>
                          <div className="text-xs text-slate-500 font-medium">{app.designation}</div>

                          <div className="flex flex-col gap-0.5 pt-1">
                            <a
                              href={`mailto:${app.email}`}
                              title={app.email}
                              className="text-xs text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors truncate max-w-[220px]"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{app.email}</span>
                            </a>
                            <a
                              href={`tel:${app.phone}`}
                              className="text-xs text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{app.phone}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Location & Scale */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>
                              {app.city}, {app.state}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>{app.studentCount} students</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <div className="relative inline-block w-40">
                          <select
                            value={app.status}
                            disabled={isUpdating}
                            onChange={e =>
                              handleStatusChange(
                                app.id,
                                e.target.value as 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED'
                              )
                            }
                            className={`w-full appearance-none pl-7 pr-8 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs ${statusConfig.badge}`}
                          >
                            <option value="PENDING">Pending Review</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          {/* Dot indicator */}
                          <span
                            className={`w-2 h-2 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig.dot}`}
                          />
                          {/* Chevron icon */}
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-top whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openModal(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 shadow-2xs transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(app.id, app.organizationName)}
                            title="Delete Application"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      activeModalApp.type === 'COLLEGE'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {activeModalApp.type === 'COLLEGE' ? 'College Campus Tie-Up' : 'Charity Trust Education'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(activeModalApp.createdAt)}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeModalApp.organizationName}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalApp(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${activeModalApp.phone}`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Call {activeModalApp.phone}</span>
              </a>

              <a
                href={`https://wa.me/${activeModalApp.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200/80 transition-all flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:${activeModalApp.email}`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email {activeModalApp.email}</span>
              </a>

              {activeModalApp.website && (
                <a
                  href={
                    activeModalApp.website.startsWith('http')
                      ? activeModalApp.website
                      : `https://${activeModalApp.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Authorized Contact:
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {activeModalApp.contactPerson}
                </span>
                <span className="text-slate-500 font-medium">{activeModalApp.designation}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Campus / Headquarters:
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block flex items-center gap-1 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {activeModalApp.city}, {activeModalApp.state}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Student Strength / Beneficiaries:
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block text-sm flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {activeModalApp.studentCount} Students
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  {activeModalApp.type === 'COLLEGE' ? 'AISHE / Affiliation Code:' : 'Trust Reg / Darpan ID:'}
                </span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  {activeModalApp.registrationNumber || 'Not provided'}
                </span>
              </div>

              {activeModalApp.category && (
                <div className="col-span-full pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                    Category / Department:
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {activeModalApp.category}
                  </span>
                </div>
              )}

              {activeModalApp.interestAreas && (
                <div className="col-span-full pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                    Interested Training Domains:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {activeModalApp.interestAreas.split(',').map((domain, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs shadow-2xs"
                      >
                        {domain.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Proposal / Message */}
            {activeModalApp.message && (
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Proposal Message / Objectives:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeModalApp.message}
                </p>
              </div>
            )}

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Internal Administrative Notes / MoU Log:
              </label>
              <textarea
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                rows={3}
                placeholder="Log internal updates (e.g., TPO contacted on 26 Oct, signed MoU for 120 CSE students)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={saveAdminNotes}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Save Notes
              </button>
            </div>

            {/* Status Change Footer Bar */}
            <div className="p-4 bg-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">Quick Status Update:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeModalApp.id, 'CONTACTED', notesInput)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeModalApp.id, 'APPROVED', notesInput)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  Approve Partnership &amp; Send Email
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeModalApp.id, 'REJECTED', notesInput)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
