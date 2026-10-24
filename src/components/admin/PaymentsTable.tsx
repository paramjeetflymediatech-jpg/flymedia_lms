'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export interface PaymentUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role?: string;
  freeDemoCredits?: number;
  referralCode?: string | null;
}

export interface PaymentPackage {
  id: string;
  title: string;
  slug?: string;
  thumbnail?: string | null;
  price?: number | string | null;
}

export interface PaymentItem {
  id: string;
  transactionId: string;
  amount: number | string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  provider: string;
  createdAt: string | Date;
  user?: PaymentUser | null;
  package?: PaymentPackage | null;
}

interface PaymentsTableProps {
  payments: PaymentItem[];
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      // Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const txnMatch = p.transactionId?.toLowerCase().includes(term);
      const nameMatch = p.user?.name?.toLowerCase().includes(term);
      const emailMatch = p.user?.email?.toLowerCase().includes(term);
      const phoneMatch = p.user?.phone?.toLowerCase().includes(term);
      const pkgMatch = p.package?.title?.toLowerCase().includes(term);

      return txnMatch || nameMatch || emailMatch || phoneMatch || pkgMatch;
    });
  }, [payments, statusFilter, searchTerm]);

  // Reset to page 1 on filter or search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTxnId(text);
      setTimeout(() => setCopiedTxnId(null), 2000);
    }
  };

  const getCleanPhone = (phone?: string | null) => {
    if (!phone) return null;
    const clean = phone.replace(/\D/g, '');
    return clean.length >= 10 ? clean : null;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, phone, or transaction ID..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
            🔍
          </div>
          <p className="text-sm font-bold text-slate-700">No transactions match your search</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50/80 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Student / User</th>
                <th className="px-6 py-3.5">Program / Booking</th>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {paginatedPayments.map((p) => {
                const isDemo = p.transactionId?.startsWith('DEMO_') || p.transactionId?.startsWith('FREE_DEMO_');
                const cleanPhone = getCleanPhone(p.user?.phone);
                const initial = p.user?.name ? p.user.name.charAt(0).toUpperCase() : '?';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User / Student Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.user?.avatar ? (
                          <img
                            src={p.user.avatar}
                            alt={p.user.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {initial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate">
                              {p.user?.name || 'Anonymous User'}
                            </span>
                            {p.user?.role && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                {p.user.role}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{p.user?.email || 'No email registered'}</div>
                          {p.user?.phone ? (
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`tel:${p.user.phone}`}
                                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                                title="Click to call"
                              >
                                📞 {p.user.phone}
                              </a>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] bg-emerald-100/60 px-1.5 py-0.5 rounded hover:bg-emerald-100"
                                  title="Chat on WhatsApp"
                                >
                                  WhatsApp ↗
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No phone provided</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Program / Booking */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {isDemo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                            ⚡ ₹99 1-ON-1 DEMO CLASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            📦 FULL COURSE
                          </span>
                        )}
                        <div className="font-semibold text-slate-800 text-xs line-clamp-2 max-w-[220px]">
                          {p.package?.title || (isDemo ? '1-on-1 Demo Session' : 'General Course')}
                        </div>
                      </div>
                    </td>

                    {/* Transaction ID & Mode */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-slate-800">
                            {p.transactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.transactionId)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Copy Transaction ID"
                          >
                            {copiedTxnId === p.transactionId ? (
                              <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Via {p.provider || 'PhonePe'}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900 text-sm">
                        ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : p.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-500'
                              : p.status === 'FAILED'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        {p.status}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium text-xs">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(p.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{' '}
              <strong className="text-slate-900">{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalItems}</strong> entries
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                safePage <= 1
                  ? 'border-slate-200 text-slate-300 bg-slate-100/50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-sm'
              }`}
            >
              Previous
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <React.Fragment key={pageNum}>
                      {prev && pageNum - prev > 1 && (
                        <span className="px-1 text-slate-400 text-xs">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          safePage === pageNum
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                safePage >= totalPages
                  ? 'border-slate-200 text-slate-300 bg-slate-100/50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-sm'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </>
    )}

      {/* ===================== USER & TRANSACTION DETAILS MODAL ===================== */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg">
                  💳
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Transaction Details</h3>
                  <p className="text-xs text-slate-300">Complete user and payment verification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Student Details Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Student Details
                  </span>
                  {selectedPayment.user?.role && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      {selectedPayment.user.role}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  {selectedPayment.user?.avatar ? (
                    <img
                      src={selectedPayment.user.avatar}
                      alt={selectedPayment.user.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                      {selectedPayment.user?.name ? selectedPayment.user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {selectedPayment.user?.name || 'Anonymous User'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedPayment.user?.email || 'No email registered'}
                    </p>
                    {selectedPayment.user?.referralCode && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Referral Code: <strong className="text-slate-700">{selectedPayment.user.referralCode}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                  {selectedPayment.user?.phone ? (
                    <>
                      <a
                        href={`tel:${selectedPayment.user.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        📞 Call {selectedPayment.user.phone}
                      </a>
                      {getCleanPhone(selectedPayment.user.phone) && (
                        <a
                          href={`https://wa.me/91${getCleanPhone(selectedPayment.user.phone)!.slice(-10)}?text=Hello%20${encodeURIComponent(selectedPayment.user.name || 'Student')},%20we%20received%20your%20demo%20booking%20at%20Flymedia%20Technology.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No phone number recorded.</span>
                  )}
                  {selectedPayment.user?.email && (
                    <a
                      href={`mailto:${selectedPayment.user.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                    >
                      ✉️ Send Email
                    </a>
                  )}
                </div>
              </div>

              {/* Program & Order Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Program & Order
                </span>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {selectedPayment.transactionId?.startsWith('DEMO_') || selectedPayment.transactionId?.startsWith('FREE_DEMO_') ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                          ⚡ 1-on-1 Demo Booking
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">
                          📦 Full Program
                        </span>
                      )}
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      {selectedPayment.package?.title || 'Personalized 1-on-1 Mentorship'}
                    </h5>
                  </div>
                  {selectedPayment.package?.slug && (
                    <Link
                      href={`/packages/${selectedPayment.package.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-orange-600 hover:underline shrink-0"
                    >
                      View Course ↗
                    </Link>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Payment Breakdown
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Transaction ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-800">{selectedPayment.transactionId}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedPayment.transactionId)}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy"
                      >
                        {copiedTxnId === selectedPayment.transactionId ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Gateway Provider</span>
                    <span className="font-bold text-slate-800">{selectedPayment.provider || 'PhonePe'}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        selectedPayment.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedPayment.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {selectedPayment.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Date & Time</span>
                    <span className="font-medium text-slate-800">
                      {new Date(selectedPayment.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-sm font-black text-slate-900">
                    <span>Total Amount Paid</span>
                    <span className="text-base text-emerald-700">
                      ₹{Number(selectedPayment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Quick Schedule Demo Class */}
              <div className="pt-2">
                <Link
                  href="/admin/tutors"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <span>⚡ Schedule Class / Assign Tutor to this Student</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
