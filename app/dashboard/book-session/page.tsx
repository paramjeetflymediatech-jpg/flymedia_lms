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
            Swal.fire('Booked!', res.message, 'success');
            // Remove the booked slot from the UI
            setDaySlots(prev => prev.filter(s => s.id !== slotId));
            // If it was the last slot for that day, we should technically remove the indicator, but we can just leave it or refetch
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
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600">1</span>
            Choose a Tutor
          </h2>

          {isLoadingTutors ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
              <Link href="/packages" className="inline-block px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200">
                Explore Packages
              </Link>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No tutors available at the moment.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {tutors.map(tutor => (
                <div key={tutor.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left transition-all hover:shadow-md hover:border-purple-200 group gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-purple-600 font-bold text-xl shrink-0">
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
                    className="w-full sm:w-auto px-8 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors"
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
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl mb-6">
               <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center font-bold text-purple-600">
                  {selectedTutor.avatar ? <img src={selectedTutor.avatar} className="w-full h-full object-cover" /> : selectedTutor.name.substring(0,2).toUpperCase()}
               </div>
               <div>
                 <p className="text-xs font-black uppercase tracking-wider text-purple-400 mb-0.5">Booking with</p>
                 <p className="font-bold text-slate-800">{selectedTutor.name}</p>
               </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-1">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(day => <div key={day} className="text-center font-bold text-xs uppercase tracking-wider text-slate-400 py-2">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarGrid().map((day, idx) => {
                const isSelected = selectedDate === day.dateString;
                const hasSlots = monthSlots.includes(day.dateString);
                const isToday = formatDateString(new Date()) === day.dateString;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.dateString)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      relative flex flex-col items-center justify-center py-2 rounded-xl transition-all border
                      ${!day.isCurrentMonth ? 'text-slate-200 bg-transparent border-transparent cursor-not-allowed' : 'text-slate-700 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-100'}
                      ${isSelected ? '!bg-purple-600 !text-white !border-purple-600 shadow-md shadow-purple-200' : ''}
                      ${isToday && !isSelected ? '!border-purple-200 text-purple-700 font-black' : ''}
                    `}
                  >
                    <span className="text-sm font-bold">{day.dayNum}</span>
                    {hasSlots && (
                      <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`}></div>
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
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      {daySlots.length} available {daySlots.length === 1 ? 'slot' : 'slots'}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {isLoadingDay ? (
                      <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
                    ) : daySlots.length === 0 ? (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><polyline points="12 6 12 12 16 14"/></svg>
                        <p className="text-slate-500 font-bold">No availability on this date</p>
                        <p className="text-sm text-slate-400 mt-1">Please select another date from the calendar.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className="p-5 rounded-2xl bg-white border-2 border-slate-100 hover:border-purple-200 transition-colors flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                               </div>
                               <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Session Time</p>
                                 <span className="font-bold text-slate-700 text-sm">
                                   {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                 </span>
                               </div>
                            </div>
                            <button 
                              onClick={() => handleBookSlot(slot.id)}
                              disabled={bookingSlotId === slot.id}
                              className="mt-auto w-full py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 shadow-sm shadow-purple-200 disabled:opacity-50"
                            >
                              {bookingSlotId === slot.id ? (
                                <span className="animate-pulse">Booking...</span>
                              ) : (
                                <>Book Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg></>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
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
