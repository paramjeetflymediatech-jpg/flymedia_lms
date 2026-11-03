'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';

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
  'B.Tech / B.E (CSE / IT / ECE / Other)',
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

export default function DedicatedInternshipForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    domain: string;
    duration: string;
    mode: string;
    resumeName?: string | null;
  } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(YEARS_OF_STUDY[2]);
  const [domain, setDomain] = useState(INTERNSHIP_DOMAINS[0]);
  const [duration, setDuration] = useState(INTERNSHIP_DURATIONS[1]);
  const [mode, setMode] = useState<'CAMPUS' | 'ONLINE' | 'HYBRID'>('HYBRID');
  const [startDate, setStartDate] = useState('Immediate / Next Batch');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
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
      setFileError('Invalid file format. Please upload a PDF file (.pdf).');
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    // Check file size: 100 KB to 200 KB
    const minBytes = 100 * 1024; // 102,400 bytes
    const maxBytes = 200 * 1024; // 204,800 bytes
    const sizeKb = file.size / 1024;

    if (file.size < minBytes) {
      setFileError(`File is too small (${sizeKb.toFixed(1)} KB). Resume size must be at least 100 KB.`);
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > maxBytes) {
      setFileError(`File exceeds limit (${sizeKb.toFixed(1)} KB). Resume size must be 200 KB or less.`);
      setResumeFile(null);
      e.target.value = '';
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !college.trim()) {
      setError('Please fill in your name, email, phone number, and college name.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile / WhatsApp number.');
      return;
    }

    if (fileError) {
      setError('Please resolve the resume upload error before submitting.');
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
      if (resumeUrl.trim()) formData.append('resumeUrl', resumeUrl.trim());
      if (portfolioUrl.trim()) formData.append('portfolioUrl', portfolioUrl.trim());
      if (message.trim()) formData.append('message', message.trim());
      if (resumeFile) formData.append('resumeFile', resumeFile);

      const res = await fetch('/api/internship/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      try {
        localStorage.setItem('flymedia_internship_submitted', 'true');
        sessionStorage.setItem('flymedia_internship_submitted', 'true');
      } catch {}

      setSubmittedData({
        fullName,
        email,
        phone,
        domain,
        duration,
        mode,
        resumeName: resumeFile ? resumeFile.name : null,
      });

      Swal.fire({
        title: 'Application Submitted! 🎉',
        html: `Thank you <b>${fullName}</b>! Your internship application for <b>${domain}</b> has been received. Our counselor will contact you via WhatsApp / Call within 24-48 hours.`,
        icon: 'success',
        confirmButtonColor: '#ea580c',
        confirmButtonText: 'Great, Continue',
      });
    } catch (err: any) {
      console.error('Internship submission error:', err);
      setError(err?.message || 'Something went wrong while submitting. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedData) {
    return (
      <div className="py-8 sm:py-12 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm">
          ✓
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
            Application Received Successfully
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            You&apos;re All Set, {submittedData.fullName}!
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            We have sent a confirmation email to <strong className="text-slate-900">{submittedData.email}</strong>. Our admissions &amp; technical mentor team will contact you via WhatsApp or Call within 24-48 hours.
          </p>
        </div>

        {/* Application Summary Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs sm:text-sm text-slate-700 space-y-2.5">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">Specialization:</span>
            <span className="font-extrabold text-slate-900">{submittedData.domain}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-semibold">Duration:</span>
            <span className="font-extrabold text-slate-900">{submittedData.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Learning Mode:</span>
            <span className="font-extrabold text-rose-600 uppercase">{submittedData.mode}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <a
            href={`https://wa.me/919779324178?text=${encodeURIComponent(
              `Hi Flymedia, I have just submitted my application for the ${submittedData.domain} internship (${submittedData.duration}). My name is ${submittedData.fullName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>💬 Chat with Counselor on WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 transition-colors flex items-center justify-center"
          >
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold rounded-2xl animate-in fade-in flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ================= SECTION 1: PERSONAL & CONTACT ================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
            1
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Personal &amp; Contact Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              WhatsApp / Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Your City / Town
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Ludhiana, Jalandhar, Chandigarh"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
            />
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: ACADEMIC BACKGROUND ================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
            2
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Academic Background
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              College / University Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Guru Nanak Dev Engineering College (GNDEC), PCTE, CT University, LPU"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Degree / Course <span className="text-rose-500">*</span>
            </label>
            <select
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Year of Study <span className="text-rose-500">*</span>
            </label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {YEARS_OF_STUDY.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: INTERNSHIP PREFERENCES ================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
            3
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Internship Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Internship Domain / Track <span className="text-rose-500">*</span>
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-bold transition-all cursor-pointer"
            >
              {INTERNSHIP_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Training Duration <span className="text-rose-500">*</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {INTERNSHIP_DURATIONS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              When Can You Start?
            </label>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <option value="Immediate / Next Batch">Immediate / Next Batch</option>
              <option value="Within 1-2 Weeks">Within 1-2 Weeks</option>
              <option value="Next Month">Next Month</option>
              <option value="Summer Vacation (June - July)">Summer Vacation (June - July)</option>
              <option value="Winter Vacation (Dec - Jan)">Winter Vacation (Dec - Jan)</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Preferred Learning Mode <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'CAMPUS', label: '🏫 Campus Lab', desc: 'Offline at Ludhiana campus' },
                  { id: 'ONLINE', label: '🌐 Live Online', desc: 'Interactive Google Meet' },
                  { id: 'HYBRID', label: '⚡ Hybrid Flex', desc: 'Campus + Online flexibility' },
                ] as const
              ).map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    mode === m.id
                      ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900">{m.label}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        mode === m.id ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                      }`}
                    >
                      {mode === m.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: LINKS & MESSAGE (OPTIONAL) ================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
            4
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Links &amp; Message <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* PDF Resume Upload Component */}
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Upload Resume (PDF Format)
              </label>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span>📄 PDF Only</span>
                <span>•</span>
                <span>Size: 100 KB – 200 KB</span>
              </span>
            </div>

            {resumeFile ? (
              <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{resumeFile.name}</p>
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <span>{(resumeFile.size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>✓ Valid 100–200 KB PDF size</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    setFileError('');
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all ml-3 shrink-0 cursor-pointer"
                >
                  Change File
                </button>
              </div>
            ) : (
              <label
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  fileError
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-orange-50/40 hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-2xl">
                    📎
                  </div>
                  <div>
                    <span className="text-sm font-bold text-orange-600 hover:underline">
                      Click to choose PDF Resume
                    </span>
                    <span className="text-sm text-slate-500 font-medium"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Strictly PDF (.pdf) format • Required size between 100 KB and 200 KB
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

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Or Paste Resume / LinkedIn / Portfolio Link (Optional)
            </label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Any Questions, College NOC Requirements, or Goals?
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about what you want to learn, or if you need an acceptance letter for your college..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-base sm:text-sm font-semibold transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* ================= SUBMIT BUTTON ================= */}
      <div className="pt-4 space-y-3">
        <button
          type="submit"
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
          className="w-full py-4 px-6 rounded-2xl text-white font-black text-base sm:text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Submitting Your Application...</span>
            </>
          ) : (
            <>
              <span>Submit Internship Application</span>
              <span className="text-xl">&rarr;</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>100% Free Application • Official College Acceptance Letter Provided</span>
        </p>
      </div>
    </form>
  );
}

