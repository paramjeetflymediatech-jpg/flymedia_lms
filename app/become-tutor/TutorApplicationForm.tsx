'use client';

import { useState } from 'react';

export default function TutorApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    expertise: '',
    experience: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 3) newErrors.fullName = "Name must be at least 3 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";

    const phoneRegex = /^\+?[0-9\s\-\(\)]{10,15}$/;
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Please enter a valid phone number (10-15 digits)";

    if (!formData.expertise) newErrors.expertise = "Please select your primary expertise";

    if (!formData.experience.trim()) newErrors.experience = "Teaching experience is required";
    else if (formData.experience.trim().length < 20) newErrors.experience = "Please provide more detail (minimum 20 characters)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    const formDataObj = new FormData();
    formDataObj.append('fullName', formData.fullName);
    formDataObj.append('email', formData.email);
    formDataObj.append('phone', formData.phone);
    formDataObj.append('expertise', formData.expertise);
    formDataObj.append('experience', formData.experience);

    try {
      // Dynamic import to avoid client-side bundling issues with server actions
      const { submitTutorApplication } = await import('../../app/actions');
      const result = await submitTutorApplication(formDataObj);
      
      if (result.error) {
        setErrors({ submit: result.error });
      } else {
        setSubmitted(true);
        setFormData({ fullName: '', email: '', phone: '', expertise: '', experience: '' });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-green-50 rounded-3xl border border-green-100 text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Application Received!</h3>
        <p className="text-slate-600">
          Thank you for your interest. Our academic team will review your profile and get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 inline-flex justify-center px-6 py-2.5 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
          {errors.submit}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-bold text-slate-700">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            type="text"
            className={`block w-full rounded-2xl border ${errors.fullName ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-orange-500/10'} px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all text-sm font-medium`}
            placeholder="John Doe"
          />
          {errors.fullName && <p className="text-red-500 text-xs font-bold mt-1 pl-1">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-bold text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            className={`block w-full rounded-2xl border ${errors.email ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-orange-500/10'} px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all text-sm font-medium`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs font-bold mt-1 pl-1">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-bold text-slate-700">
          Phone Number <span className="text-slate-400 font-normal">(WhatsApp preferred)</span>
        </label>
        <input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          type="tel"
          className={`block w-full rounded-2xl border ${errors.phone ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-orange-500/10'} px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all text-sm font-medium`}
          placeholder="+1 (555) 000-0000"
        />
        {errors.phone && <p className="text-red-500 text-xs font-bold mt-1 pl-1">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="expertise" className="block text-sm font-bold text-slate-700">
          Area of Expertise
        </label>
        <div className="relative">
          <select
            id="expertise"
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            className={`block w-full rounded-2xl border ${errors.expertise ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10 text-red-900' : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 text-slate-900'} px-4 py-3 focus:outline-none focus:ring-4 transition-all text-sm font-medium appearance-none cursor-pointer`}
          >
            <option value="" disabled>Select your primary expertise...</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Video Editor">Video Editor</option>
            <option value="Graphic Designer">Graphic Designer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="Mobile App Developer">Mobile App Developer</option>
            <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
            <option value="IELTS / English Language">IELTS / English Language</option>
            <option value="Business & Management">Business & Management</option>
            <option value="Other">Other</option>
          </select>
          <div className={`absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none ${errors.expertise ? 'text-red-400' : 'text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        {errors.expertise && <p className="text-red-500 text-xs font-bold mt-1 pl-1">{errors.expertise}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="experience" className="block text-sm font-bold text-slate-700">
          Teaching Experience
        </label>
        <textarea
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows={3}
          className={`block w-full rounded-2xl border ${errors.experience ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-orange-500 focus:ring-orange-500/10'} px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all text-sm font-medium resize-none`}
          placeholder="Briefly describe your past teaching or industry experience..."
        />
        {errors.experience && <p className="text-red-500 text-xs font-bold mt-1 pl-1">{errors.experience}</p>}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
          className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-600/20 text-base font-black text-white hover:opacity-90 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden hover:-translate-y-1"
        >
          <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative flex items-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Submitting Application...
              </>
            ) : (
              <>
                Start Your Journey
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
