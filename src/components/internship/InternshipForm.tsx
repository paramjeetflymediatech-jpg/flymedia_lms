'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export const INTERNSHIP_DOMAINS = [
  'Full Stack Web Development (MERN & Next.js)',
  'Python, AI & Machine Learning',
  'Digital Marketing, SEO & Growth Strategy',
  'Graphic Designing & UI/UX (Figma / Adobe)',
  'Professional Video Editing & Motion Graphics',
  'Mobile App Development (Flutter / React Native)',
  'Software Testing & Automation QA',
  'Other / Custom Training Track',
];

export const INTERNSHIP_DURATIONS = [
  '45 Days (Summer Training)',
  '6 Weeks (Summer Internship)',
  '3 Months (Project Internship)',
  '6 Months (Industrial Training & Placement)',
];

export const QUALIFICATIONS = [
  'B.Tech / B.E (CSE / IT / ECE)',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'Diploma / Polytechnic',
  'B.Sc Computer Science / IT',
  'M.Sc Computer Science / IT',
  'Other Degree / Graduate',
];

export const YEARS_OF_STUDY = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  'Final Year (4th Year / Sem 7-8)',
  'Recent Passout / Graduate',
];

interface InternshipFormProps {
  variant?: 'page' | 'modal';
  defaultDomain?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InternshipForm({
  variant = 'page',
  defaultDomain,
  onSuccess,
  onCancel,
}: InternshipFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [resumeOption, setResumeOption] = useState<'FILE' | 'URL'>('FILE');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(YEARS_OF_STUDY[2]);
  const [domain, setDomain] = useState(defaultDomain || INTERNSHIP_DOMAINS[0]);
  const [duration, setDuration] = useState(INTERNSHIP_DURATIONS[1]);
  const [mode, setMode] = useState<'CAMPUS' | 'ONLINE' | 'HYBRID'>('HYBRID');
  const [startDate, setStartDate] = useState('Immediate / Next Batch');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) {
      setResumeFile(null);
      return;
    }

    // Check PDF format
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      setFileError('Invalid format. Please upload a PDF file (.pdf).');
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    // Check file size: Max 5 MB
    const maxBytes = 5 * 1024 * 1024;
    const sizeMb = file.size / (1024 * 1024);

    if (file.size > maxBytes) {
      setFileError(`File exceeds limit (${sizeMb.toFixed(2)} MB). Must be 5 MB or less.`);
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Quick validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !college.trim()) {
      setError('Please fill in your name, email, phone number, and college name.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile / WhatsApp number.');
      return;
    }

    if (fileError) {
      setError('Please resolve the resume file error before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone', cleanPhone);
      formData.append('college', college.trim());
      formData.append('qualification', qualification);
      formData.append('yearOfStudy', yearOfStudy);
      formData.append('domain', domain);
      formData.append('duration', duration);
      formData.append('mode', mode);
      formData.append('startDate', startDate);
      if (city.trim()) formData.append('city', city.trim());
      if (state.trim()) formData.append('state', state.trim());
      if (resumeOption === 'FILE' && resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else if (resumeOption === 'URL' && resumeUrl.trim()) {
        formData.append('resumeUrl', resumeUrl.trim());
      }
      if (portfolioUrl.trim()) formData.append('portfolioUrl', portfolioUrl.trim());
      if (message.trim()) formData.append('message', message.trim());

      const res = await fetch('/api/internship/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSuccess(true);

      // Save submission flag so we don't annoy the student with duplicate popups
      try {
        localStorage.setItem('flymedia_internship_submitted', 'true');
        sessionStorage.setItem('flymedia_internship_submitted', 'true');
      } catch {}

      Swal.fire({
        title: 'Application Submitted! 🎉',
        html: `Thank you <b>${fullName}</b>! Your internship application for <b>${domain}</b> has been received. Our counselor will contact you via WhatsApp / Call within 24-48 hours.`,
        icon: 'success',
        confirmButtonColor: '#ea580c',
        confirmButtonText: 'Great, Thank You!',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Internship submission error:', err);
      setError(err?.message || 'Something went wrong while submitting. Please check your connection or contact our helpline.');
    } finally {
      setLoading(false);
    }
  };

  const isModal = variant === 'modal';

  if (success) {
    return (
      <div className={`p-8 text-center rounded-3xl bg-emerald-50 border border-emerald-100 shadow-sm animate-in fade-in duration-300 ${isModal ? 'py-10' : 'py-12'}`}>
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          ✓
        </div>
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full mb-3">
          Application Received
        </span>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          You&apos;re All Set, {fullName}!
        </h3>
        <p className="text-sm font-medium text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          We have emailed a confirmation copy to <strong className="text-slate-800">{email}</strong>. Our admissions &amp; technical mentor team will contact you shortly to confirm your interview and onboarding details.
        </p>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 max-w-md mx-auto text-left text-xs text-slate-700 space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Domain:</span>
            <span className="font-bold text-slate-900">{domain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Duration:</span>
            <span className="font-bold text-slate-900">{duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Mode:</span>
            <span className="font-bold text-rose-600 uppercase">{mode}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+919779324178"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <span>📞 Call Admissions Helpline</span>
          </a>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${
        isModal
          ? 'bg-white'
          : 'bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-xl'
      }`}
    >
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl animate-in fade-in flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Top Banner Offer in Form */}
      <div className="bg-gradient-to-r from-orange-50 via-rose-50 to-amber-50 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-black text-slate-800 tracking-tight">
            2026 - 2027 Batch Admissions Open
          </span>
        </div>
        <span className="text-[11px] font-bold text-orange-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-orange-200">
          ISO &amp; MSME Certified Letter
        </span>
      </div>

      {/* Full Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Amanpreet Singh"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. aman@gmail.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
          />
        </div>
      </div>

      {/* Phone Number & College Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            WhatsApp / Mobile <span className="text-rose-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            College / University <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="e.g. GNDEC, PCTE, CT University, LPU"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
          />
        </div>
      </div>

      {/* Qualification & Year of Study */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Current Degree / Course <span className="text-rose-500">*</span>
          </label>
          <select
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all cursor-pointer"
          >
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Year of Study <span className="text-rose-500">*</span>
          </label>
          <select
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all cursor-pointer"
          >
            {YEARS_OF_STUDY.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Domain Selection */}
      <div className="space-y-1">
        <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Internship Domain / Track <span className="text-rose-500">*</span></span>
          <span className="text-[10px] text-orange-600 font-bold">Live Client Projects</span>
        </label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-bold transition-all cursor-pointer"
        >
          {INTERNSHIP_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Duration & Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Duration <span className="text-rose-500">*</span>
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm font-semibold transition-all cursor-pointer"
          >
            {INTERNSHIP_DURATIONS.map((dur) => (
              <option key={dur} value={dur}>
                {dur}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Preferred Learning Mode <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['CAMPUS', 'ONLINE', 'HYBRID'] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border transition-all text-center cursor-pointer ${
                  mode === m
                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/25'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m === 'CAMPUS' ? '🏫 Campus' : m === 'ONLINE' ? '🌐 Online' : '⚡ Hybrid'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* City & Preferred Start */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Your City / Town
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Ludhiana, Jalandhar, Chandigarh"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-semibold transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            When Can You Start?
          </label>
          <select
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-semibold transition-all cursor-pointer"
          >
            <option value="Immediate / Next Batch">Immediate / Next Batch</option>
            <option value="Within 1-2 Weeks">Within 1-2 Weeks</option>
            <option value="Next Month">Next Month</option>
            <option value="Summer Training (June - July)">Summer Training (June - July)</option>
            <option value="Winter Training (Dec - Jan)">Winter Training (Dec - Jan)</option>
          </select>
        </div>
      </div>

      {/* Resume Section with Mutually Exclusive Option */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
            Resume Submission (Optional)
          </label>
          <span className="text-[11px] text-slate-400 font-semibold">Select one option</span>
        </div>

        {/* Tab Toggle: Upload PDF vs Paste Link */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setResumeOption('FILE');
              setResumeUrl('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              resumeOption === 'FILE'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📄 Upload PDF File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setResumeOption('URL');
              setResumeFile(null);
              setFileError('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              resumeOption === 'URL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔗 Paste Link</span>
          </button>
        </div>

        {/* Option 1: Upload File */}
        {resumeOption === 'FILE' && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {resumeFile ? (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{resumeFile.name}</p>
                    <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <span>
                        {resumeFile.size > 1024 * 1024
                          ? `${(resumeFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(resumeFile.size / 1024).toFixed(1)} KB`}
                      </span>
                      <span>•</span>
                      <span>✓ Valid PDF (Max 5 MB)</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    setFileError('');
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-bold transition-all ml-3 shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  fileError
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-orange-50/40 hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-xl">📎</span>
                  <div>
                    <span className="text-xs font-bold text-orange-600 hover:underline">
                      Click to choose PDF Resume
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Strictly PDF (.pdf) format • Maximum size: 5 MB
                  </p>
                </div>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            )}

            {fileError && (
              <p className="text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1 mt-1">
                <span>⚠️</span>
                <span>{fileError}</span>
              </p>
            )}
          </div>
        )}

        {/* Option 2: Paste Link */}
        {resumeOption === 'URL' && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... or LinkedIn profile URL"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-semibold transition-all"
            />
            <p className="text-[11px] text-slate-400 font-medium">
              Ensure Google Drive / OneDrive link permission is set to &ldquo;Anyone with the link can view&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* Questions or Message (Optional) */}
      {!isModal && (
        <div className="space-y-1">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Any Specific Goals or Questions? (Optional)
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you want to achieve or any questions regarding college NOC / timings..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-semibold transition-all resize-none"
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
          className="w-full py-3.5 px-6 rounded-xl text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all transform cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <span>Submit Internship Application</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 flex-wrap gap-2">
        <span className="flex items-center gap-1.5 font-bold text-slate-600">
          <span>🛡️</span>
          <span>College NOC &amp; MSME Recognized Letter Provided</span>
        </span>
        <a href="tel:+919779324178" className="font-bold text-orange-600 hover:underline">
          Admissions: +91-97793-24178
        </a>
      </div>
    </form>
  );
}

