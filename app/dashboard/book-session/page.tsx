"use client";

import { useState, useEffect, useTransition } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { getAllTutors, getTutorMonthAvailability, getTutorDayAvailability, bookSessionSlot, checkStudentEligibility } from "./actions";

export default function BookSessionPage() {
  // Step Management
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();

  // Tutor Data
  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [isLoadingTutors, setIsLoadingTutors] = useState(true);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  // Calendar Data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [monthSlots, setMonthSlots] = useState<string[]>([]);
  const [daySlots, setDaySlots] = useState<any[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  // 1. Fetch Tutors & Eligibility on Mount
  useEffect(() => {
    startTransition(async () => {
      const eligibilityRes = await checkStudentEligibility();
      if (eligibilityRes.success && eligibilityRes.data?.isEligible) {
        setIsEligible(true);
        const res = await getAllTutors();
        if (res.success) {
          setTutors(res.data);
        }
      } else {
        setIsEligible(false);
      }
      setIsLoadingTutors(false);
    });
  }, []);

  // 2. Fetch Month Availability when Calendar Month or Tutor Changes
  useEffect(() => {
    if (step === 2 && selectedTutor) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      setIsLoadingMonth(true);
      startTransition(async () => {
        const res = await getTutorMonthAvailability(selectedTutor.id, year, month);
        if (res.success) {
          setMonthSlots(res.data || []);
        }
        setIsLoadingMonth(false);
      });
    }
  }, [step, selectedTutor, currentDate.getFullYear(), currentDate.getMonth()]);

  // 3. Fetch Day Availability when Date is Selected
  useEffect(() => {
    if (step === 2 && selectedTutor && selectedDate) {
      setIsLoadingDay(true);
      startTransition(async () => {
        const res = await getTutorDayAvailability(selectedTutor.id, selectedDate);
        if (res.success) {
          setDaySlots(res.data || []);
        } else {
          Swal.fire('Error', res.message, 'error');
        }
        setIsLoadingDay(false);
      });
    } else {
      setDaySlots([]);
    }
  }, [step, selectedTutor, selectedDate]);

  // Handlers
  const handleSelectTutor = (tutor: any) => {
    setSelectedTutor(tutor);
    setStep(2);
    setCurrentDate(new Date()); // Reset to current month
    setSelectedDate(""); // Clear selected date
  };

  const handleBookSlot = (slotId: string) => {
    Swal.fire({
      title: 'Confirm Booking',
      text: "Do you want to book this session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#9333ea', // purple-600
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, book it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookingSlotId(slotId);
        startTransition(async () => {
          const res = await bookSessionSlot(slotId);
          if (res.success) {
            Swal.fire({
              title: 'Booked!',
              text: res.message,
              icon: 'success',
              confirmButtonColor: '#ea580c',
            });
            // Keep the slot displayed and mark it as booked by this student
            setDaySlots(prev => prev.map(s => s.id === slotId ? { ...s, isBooked: true, isBookedByMe: true } : s));
            setMonthSlots(prev => prev.includes(selectedDate) ? prev : [...prev, selectedDate]);
          } else {
            Swal.fire('Error', res.message, 'error');
          }
          setBookingSlotId(null);
        });
      }
    });
  };

  // Calendar Helpers
  const formatDateString = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ dayNum: prevMonthDays - i, isCurrentMonth: false, dateString: formatDateString(new Date(year, month - 1, prevMonthDays - i)) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ dayNum: i, isCurrentMonth: true, dateString: formatDateString(new Date(year, month, i)) });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ dayNum: i, isCurrentMonth: false, dateString: formatDateString(new Date(year, month + 1, i)) });
    }
    return days;
  };

  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Book a Session</h1>
          <p className="text-slate-500 font-medium mt-1">Connect with expert tutors for personalized 1-on-1 learning.</p>
        </div>
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Tutors
          </button>
        )}
      </div>

      {/* STEP 1: SELECT TUTOR / CHECK ELIGIBILITY */}
      {step === 1 && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">1</span>
            Choose a Tutor
          </h2>

          {isLoadingTutors ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : isEligible === false ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No lessons available for your payments</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                You currently do not have any active course or package enrollments. Please purchase a package to unlock 1-on-1 tutoring sessions.
              </p>
              <Link href="/packages" className="inline-block px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-sm shadow-purple-200">
                Explore Packages
              </Link>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No tutors available at the moment.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {tutors.map(tutor => (
                <div key={tutor.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left transition-all hover:shadow-md hover:border-orange-200 group gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-orange-600 font-bold text-xl shrink-0">
                      {tutor.avatar ? (
                        <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                      ) : (
                        tutor.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-0.5">{tutor.name}</h3>
                      <p className="text-sm text-slate-500">Expert Tutor</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelectTutor(tutor)}
                    className="w-full sm:w-auto px-8 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors"
                  >
                    View Availability
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SELECT TIME SLOT */}
      {step === 2 && selectedTutor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CALENDAR WIDGET */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 h-fit">
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl mb-6">
               <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center font-bold text-orange-600">
                  {selectedTutor.avatar ? <img src={selectedTutor.avatar} className="w-full h-full object-cover" /> : selectedTutor.name.substring(0,2).toUpperCase()}
               </div>
               <div>
                 <p className="text-xs font-black uppercase tracking-wider text-orange-400 mb-0.5">Booking with</p>
                 <p className="font-bold text-slate-800">{selectedTutor.name}</p>
               </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              {(() => {
                const now = new Date();
                const isCurrentOrPastMonth = (currentDate.getFullYear() < now.getFullYear()) || (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() <= now.getMonth());
                return (
                  <div className="flex gap-1">
                    <button 
                      disabled={isCurrentOrPastMonth}
                      onClick={() => !isCurrentOrPastMonth && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCurrentOrPastMonth ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                      title={isCurrentOrPastMonth ? "Cannot browse past months" : "Previous month"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(day => <div key={day} className="text-center font-bold text-xs uppercase tracking-wider text-slate-400 py-2">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarGrid().map((day, idx) => {
                const now = new Date();
                const todayString = formatDateString(now);
                const isSelected = selectedDate === day.dateString;
                const hasSlots = monthSlots.includes(day.dateString);
                const isToday = todayString === day.dateString;
                const isPastDate = day.dateString < todayString;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.dateString)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      relative flex flex-col items-center justify-center py-2 rounded-xl transition-all border
                      ${!day.isCurrentMonth ? 'text-slate-200 bg-transparent border-transparent cursor-not-allowed' : isPastDate ? 'text-slate-400 bg-slate-50/50 border-slate-100 hover:bg-slate-100' : 'text-slate-700 bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-100'}
                      ${isSelected ? '!bg-orange-600 !text-white !border-orange-600 shadow-md shadow-purple-200' : ''}
                      ${isToday && !isSelected ? '!border-orange-200 text-orange-700 font-black' : ''}
                    `}
                  >
                    <span className="text-sm font-bold">{day.dayNum}</span>
                    {hasSlots && (
                      <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : isPastDate ? 'bg-slate-300' : 'bg-orange-500'}`}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DAY DETAILS / SLOTS PANEL */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col">
              {selectedDate ? (
                <>
                  {(() => {
                    const now = new Date();
                    const todayString = formatDateString(now);
                    const isSelectedDateInPast = selectedDate < todayString;
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                    const availableSlots = daySlots.filter((s) => {
                      const isExpired = Boolean(s.isPast) || isSelectedDateInPast || (selectedDate === todayString && s.startTime <= currentTime);
                      return !s.isBooked && !isExpired;
                    });
                    const myBookedSlots = daySlots.filter((s) => Boolean(s.isBookedByMe));

                    return (
                      <>
                        <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <div className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2 flex-wrap">
                              <span>
                                {availableSlots.length} available {availableSlots.length === 1 ? 'slot' : 'slots'}
                              </span>
                              {myBookedSlots.length > 0 && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    {myBookedSlots.length} booked by you
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {myBookedSlots.length > 0 && (
                            <Link
                              href="/dashboard/courses"
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <span>View My Sessions</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                          )}
                        </div>

                        {isSelectedDateInPast && (
                          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-amber-800">
                            <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            This date is in the past. Slots on previous dates cannot be joined or booked.
                          </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                          {isLoadingDay ? (
                            <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>
                          ) : daySlots.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><polyline points="12 6 12 12 16 14"/></svg>
                              <p className="text-slate-500 font-bold">No availability on this date</p>
                              <p className="text-sm text-slate-400 mt-1">Please select another date from the calendar.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {daySlots.map((slot) => {
                                const isBookedByMe = Boolean(slot.isBookedByMe);
                                const isBookedByOther = Boolean(slot.isBooked) && !isBookedByMe;
                                const isSlotExpired = !isBookedByMe && (Boolean(slot.isPast) || isSelectedDateInPast || (selectedDate === todayString && slot.startTime <= currentTime));

                                let cardClasses = "p-5 rounded-2xl bg-white border-2 transition-all flex flex-col ";
                                let iconClasses = "p-2 rounded-lg ";
                                let timeClasses = "font-bold text-sm ";

                                if (isBookedByMe) {
                                  cardClasses += "border-emerald-300 bg-emerald-50/30 shadow-sm ring-1 ring-emerald-200/50";
                                  iconClasses += "bg-emerald-100 text-emerald-700";
                                  timeClasses += "text-emerald-950";
                                } else if (isBookedByOther) {
                                  cardClasses += "border-slate-200 bg-slate-50/70 opacity-75";
                                  iconClasses += "bg-slate-100 text-slate-400";
                                  timeClasses += "text-slate-500";
                                } else if (isSlotExpired) {
                                  cardClasses += "border-slate-100 bg-slate-50/60 opacity-80";
                                  iconClasses += "bg-slate-100 text-slate-400";
                                  timeClasses += "text-slate-400 line-through";
                                } else {
                                  cardClasses += "border-slate-100 hover:border-orange-200";
                                  iconClasses += "bg-orange-50 text-orange-600";
                                  timeClasses += "text-slate-700";
                                }

                                return (
                                  <div key={slot.id} className={cardClasses}>
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className={iconClasses}>
                                          {isBookedByMe ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Session Time</p>
                                          <span className={timeClasses}>
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                          </span>
                                        </div>
                                      </div>

                                      {isBookedByMe && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200 shadow-xs">
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                          Booked by You
                                        </span>
                                      )}
                                      {isBookedByOther && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                                          Already Booked
                                        </span>
                                      )}
                                      {!slot.isBooked && isSlotExpired && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                                          Expired
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Button */}
                                    {isBookedByMe ? (
                                      <div className="mt-auto space-y-2 pt-2">
                                        <div className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 text-white flex justify-center items-center gap-2 shadow-sm shadow-emerald-200 select-none">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                          <span>Booked</span>
                                        </div>
                                        <Link
                                          href="/dashboard/courses"
                                          className="w-full py-1 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center justify-center gap-1 transition-colors"
                                        >
                                          <span>View in My Sessions</span>
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                      </div>
                                    ) : isBookedByOther ? (
                                      <button 
                                        disabled
                                        className="mt-auto w-full py-2.5 rounded-xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none flex justify-center items-center gap-2"
                                      >
                                        <span>Already Booked</span>
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                      </button>
                                    ) : isSlotExpired ? (
                                      <button 
                                        disabled
                                        className="mt-auto w-full py-2.5 rounded-xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none flex justify-center items-center gap-2"
                                      >
                                        <span>Slot Expired</span>
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleBookSlot(slot.id)}
                                        disabled={bookingSlotId === slot.id}
                                        className="mt-auto w-full py-2.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-sm text-white bg-orange-600 hover:bg-orange-700 shadow-orange-200 active:scale-[0.98]"
                                      >
                                        {bookingSlotId === slot.id ? (
                                          <span className="animate-pulse">Booking...</span>
                                        ) : (
                                          <>Book Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg></>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Select a Date</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs">Click on any highlighted date in the calendar to view {selectedTutor.name}'s available time slots.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
