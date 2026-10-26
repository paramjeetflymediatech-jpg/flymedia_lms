'use client';

import { useState } from 'react';
import { submitPartnerApplication } from '../../../app/actions';
import Swal from 'sweetalert2';

interface PartnerFormProps {
  defaultType?: 'COLLEGE' | 'CHARITY';
}

const COLLEGE_CATEGORIES = [
  'Engineering & Technology (B.Tech / M.Tech)',
  'Computer Applications (BCA / MCA)',
  'Polytechnic / Diploma College',
  'Management & Commerce (BBA / MBA / B.Com)',
  'Autonomous Degree College / University',
  'Vocational / Skill Training Institute',
];

const CHARITY_CATEGORIES = [
  'Registered Educational Trust',
  'Non-Profit / NGO for Youth Education',
  'Child Welfare & Orphanage Support Trust',
  'Community Empowerment Society',
  'Religious / Gurudwara / Temple Charitable Trust',
  'CSR / Philanthropic Foundation',
];

const COLLEGE_INTERESTS = [
  'Summer / Industrial Training (6 Weeks / 6 Months)',
  'Web Development & Full Stack Bootcamp',
  'Digital Marketing & SEO Mastery',
  'Python, AI & Data Science',
  'Campus Placement Drives',
  'Faculty Development & Guest Workshops',
  'Institutional Student Discount Batches',
];

const CHARITY_INTERESTS = [
  '100% Free Coding & Web Development',
  'Basic Computer & Digital Literacy',
  'Graphic Designing & Creative Tools',
  'Digital Marketing for Underprivileged Youth',
  'Spoken English & Interview Soft Skills',
  'Free Recognized Course Completion Certificates',
  'One-on-One Mentorship for Deserving Students',
];

export default function PartnerForm({ defaultType = 'COLLEGE' }: PartnerFormProps) {
  const [partnerType, setPartnerType] = useState<'COLLEGE' | 'CHARITY'>(defaultType);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const isCollege = partnerType === 'COLLEGE';

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleTypeChange = (type: 'COLLEGE' | 'CHARITY') => {
    setPartnerType(type);
    setSelectedInterests([]);
    setSubmittedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('type', partnerType);
    formData.set('interestAreas', selectedInterests.join(', '));

    try {
      const res = await submitPartnerApplication(null, formData);

      if (res?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Submission Incomplete',
          text: res.error,
          confirmButtonColor: '#E63747',
        });
      } else if (res?.success) {
        setSubmittedSuccess(true);
        form.reset();
        setSelectedInterests([]);

        Swal.fire({
          icon: 'success',
          title: isCollege ? 'College Tie-Up Proposal Received!' : 'Free Education Proposal Received!',
          text: res.message,
          confirmButtonColor: isCollege ? '#2563eb' : '#059669',
          confirmButtonText: 'Great, Thank You!',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again or call us directly.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#E63747',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="partner-form-section" className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-2 bg-slate-100/80 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTypeChange('COLLEGE')}
          className={`flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-black text-sm md:text-base transition-all duration-300 ${
            isCollege
              ? 'bg-white text-blue-700 shadow-md shadow-blue-500/10 scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm shrink-0">
            🎓
          </span>
          <span className="text-left leading-tight">
            <span className="block font-black">Colleges & Universities</span>
            <span className="block text-[11px] font-medium text-slate-500 hidden sm:inline">Student Benefits & Tie-ups</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange('CHARITY')}
          className={`flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-black text-sm md:text-base transition-all duration-300 ${
            !isCollege
              ? 'bg-white text-emerald-700 shadow-md shadow-emerald-500/10 scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0">
            🤝
          </span>
          <span className="text-left leading-tight">
            <span className="block font-black">Trusts & Charities</span>
            <span className="block text-[11px] font-semibold text-emerald-600">100% Free Education</span>
          </span>
        </button>
      </div>

      {/* Header Banner according to selected type */}
      <div className={`p-6 sm:p-8 ${isCollege ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white' : 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 bg-white/10 backdrop-blur-md border border-white/20">
              {isCollege ? '🏛️ Institutional Partnership' : '🌱 Social Impact & Free Education'}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isCollege ? 'Partner Your College with Flymedia' : 'Empower Your Trust Students with Free Education'}
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isCollege
                ? 'Fill this form to enable your college students to avail subsidized industrial training, customized curriculum batches, verified ISO certifications, and dedicated campus placements.'
                : 'Run a charitable trust, community foundation, or free learning center? Partner with Flymedia to provide 100% zero-cost tech training, live mentorship, and certificates to your students.'}
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <span className={`inline-block px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${isCollege ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
              {isCollege ? 'Campus MoU & Benefits' : '100% Free Sponsored'}
            </span>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
        {submittedSuccess && (
          <div className={`p-5 rounded-2xl border ${isCollege ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <h4 className="font-bold text-base flex items-center gap-2">
              <span>✅</span> Application Submitted Successfully!
            </h4>
            <p className="text-sm mt-1">
              Our institutional team has received your submission and will get in touch shortly. You may submit another inquiry below if needed.
            </p>
          </div>
        )}

        {/* Section 1: Organization Details */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">1</span>
            {isCollege ? 'College / University Information' : 'Trust / Charity Information'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isCollege ? 'College / Institute / University Name *' : 'Trust / Foundation / Charity Name *'}
              </label>
              <input
                type="text"
                name="organizationName"
                required
                placeholder={isCollege ? 'e.g. Guru Nanak Dev Engineering College' : 'e.g. Hope Education Charitable Trust'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isCollege ? 'Institution Type / Stream' : 'Trust Type / Category'}
              </label>
              <select
                name="category"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="">Select Category...</option>
                {(isCollege ? COLLEGE_CATEGORIES : CHARITY_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isCollege ? 'College Website (Optional)' : 'Website or Social Media Link (Optional)'}
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isCollege ? 'AISHE / Affiliation Code (Optional)' : 'Trust Reg No. / 12A / 80G / Darpan ID (Optional)'}
              </label>
              <input
                type="text"
                name="registrationNumber"
                placeholder={isCollege ? 'e.g. C-12345 or PTU/PU Affiliated' : 'e.g. Trust Reg # / Darpan ID'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person / Representative */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">2</span>
            Authorized Representative / Contact Person
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Representative Full Name *
              </label>
              <input
                type="text"
                name="contactPerson"
                required
                placeholder="e.g. Dr. Harpreet Singh / Sunita Sharma"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Designation / Role *
              </label>
              <input
                type="text"
                name="designation"
                required
                placeholder={isCollege ? 'e.g. Head of Training & Placement (TPO) / Dean / HOD' : 'e.g. Managing Trustee / Founder / Center Head'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={isCollege ? 'tpo@college.edu.in' : 'contact@trustname.org'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91-98765-43210"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City / Campus Location *
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Ludhiana / Chandigarh / Jalandhar"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State *
              </label>
              <input
                type="text"
                name="state"
                required
                defaultValue="Punjab"
                placeholder="e.g. Punjab / Haryana / Delhi"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Students Strength & Interest Areas */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">3</span>
            {isCollege ? 'Target Student Strength & Collaboration Goals' : 'Students Count & Free Learning Needs'}
          </h4>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isCollege
                  ? 'Estimated Number of Students to Avail Benefits *'
                  : 'Number of Underprivileged Students Being Supported *'}
              </label>
              <select
                name="studentCount"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="">Select student batch size...</option>
                <option value="25 - 50 students">25 - 50 students</option>
                <option value="50 - 150 students">50 - 150 students</option>
                <option value="150 - 300 students">150 - 300 students</option>
                <option value="300 - 500 students">300 - 500 students</option>
                <option value="500+ students">500+ students</option>
              </select>
            </div>

            {/* Interest Area Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {isCollege ? 'Programs & Initiatives Interested In' : 'Free Learning Domains Needed for Trust Students'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(isCollege ? COLLEGE_INTERESTS : CHARITY_INTERESTS).map(item => {
                  const checked = selectedInterests.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleInterestToggle(item)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        checked
                          ? isCollege
                            ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          checked
                            ? isCollege
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isCollege ? 'Specific Requirements / Timelines / Notes' : 'About Your Students / Special Learning Requirements'}
              </label>
              <textarea
                name="message"
                rows={3}
                placeholder={
                  isCollege
                    ? 'Mention any specific semester training start dates, branch focus (e.g. CSE, IT, BCA), or customized syllabus requirements...'
                    : 'Tell us a bit about the children/students under your trust, their current education level, and how we can best support them...'
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-y"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified partnership with Flymedia Technology Ludhiana</span>
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none ${
              isCollege
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:shadow-blue-500/30'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:shadow-emerald-500/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting Proposal...</span>
              </>
            ) : (
              <>
                <span>{isCollege ? 'Submit College Partnership Proposal' : 'Submit Free Education Trust Request'}</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
