"use client";

import { useState, useEffect, useTransition } from "react";
import { getAvailabilitySlots, getMonthAvailabilitySlots, addAvailabilitySlot, deleteAvailabilitySlot } from "./actions";
import Swal from "sweetalert2";

export default function AvailabilityCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [monthSlots, setMonthSlots] = useState<string[]>([]);
  const [daySlots, setDaySlots] = useState<any[]>([]);
  
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Slot State
  const [showAddForm, setShowAddForm] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Helper to format YYYY-MM-DD
  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Fetch month slots when month changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    setIsLoadingMonth(true);
    startTransition(async () => {
      const res = await getMonthAvailabilitySlots(year, month);
      if (res.success) {
        setMonthSlots(res.data || []);
      } else {
        console.error(res.message);
      }
      setIsLoadingMonth(false);
    });
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  // Fetch day slots when selected date changes
  useEffect(() => {
    if (!selectedDate) {
      setDaySlots([]);
      return;
    }
    
    setIsLoadingDay(true);
    startTransition(async () => {
      const res = await getAvailabilitySlots(selectedDate);
      if (res.success) {
        setDaySlots(res.data || []);
      } else {
        Swal.fire('Error', res.message, 'error');
      }
      setIsLoadingDay(false);
    });
  }, [selectedDate]);

  // Calendar generation logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        dateString: formatDateString(new Date(year, month - 1, prevMonthDays - i))
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        dateString: formatDateString(new Date(year, month, i))
      });
    }
    
    // Next month padding
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateString: formatDateString(new Date(year, month + 1, i))
      });
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Format 24h time to 12h time (e.g., 17:40 to 5:40 PM)
  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const handleAddSlot = () => {
    if (!startTime || !endTime) {
      Swal.fire('Error', 'Please select both start and end times.', 'warning');
      return;
    }
    if (startTime >= endTime) {
      Swal.fire('Error', 'End time must be after start time.', 'warning');
      return;
    }

    setIsSubmitting(true);
    startTransition(async () => {
      const res = await addAvailabilitySlot(selectedDate, startTime, endTime);
      if (res.success) {
        Swal.fire({ title: 'Success!', text: 'Time slot added.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        setDaySlots([...daySlots, res.data].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        if (!monthSlots.includes(selectedDate)) {
          setMonthSlots([...monthSlots, selectedDate]);
        }
        setShowAddForm(false);
        setStartTime("");
        setEndTime("");
      } else {
        Swal.fire('Error', res.message, 'error');
      }
      setIsSubmitting(false);
    });
  };

  const handleDeleteSlot = (id: string, isBooked: boolean) => {
    if (isBooked) {
      Swal.fire('Error', 'Cannot delete a booked slot.', 'error');
      return;
    }

    Swal.fire({
      title: 'Delete this slot?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await deleteAvailabilitySlot(id);
          if (res.success) {
            const updatedSlots = daySlots.filter(s => s.id !== id);
            setDaySlots(updatedSlots);
            if (updatedSlots.length === 0) {
              setMonthSlots(monthSlots.filter(d => d !== selectedDate));
            }
            Swal.fire({ title: 'Deleted!', text: 'Your time slot has been deleted.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          } else {
            Swal.fire('Error', res.message, 'error');
          }
        });
      }
    });
  };

  const calendarDays = generateCalendarGrid();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black font-medium">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            Availability Calendar
          </h1>
          <p className="text-slate-500 font-bold mt-1">Manage your teaching schedule and available time slots.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CALENDAR GRID */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 h-fit">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center font-bold text-xs uppercase tracking-wider text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate === day.dateString;
                const hasSlots = monthSlots.includes(day.dateString);
                const isToday = formatDateString(new Date()) === day.dateString;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`
                      relative flex flex-col items-center justify-center py-2 rounded-xl transition-all border
                      ${!day.isCurrentMonth ? 'text-slate-300 bg-transparent border-transparent' : 'text-slate-700 bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-100'}
                      ${isSelected ? '!bg-orange-600 !text-white !border-orange-600 shadow-md shadow-orange-200' : ''}
                      ${isToday && !isSelected ? '!border-orange-200 text-orange-700 font-black' : ''}
                    `}
                  >
                    <span className="text-sm font-bold">{day.dayNum}</span>
                    {/* Indicator Dot */}
                    {hasSlots && (
                      <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DAY DETAILS / SLOTS PANEL */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-slate-100 flex-1 flex flex-col">
              {selectedDate ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        {daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'} available
                      </p>
                    </div>
                    {!showAddForm && (
                      <button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-xl transition-colors shadow-lg shadow-orange-200"
                        title="Add Slot"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      </button>
                    )}
                  </div>

                  {showAddForm && (
                    <div className="mb-6 bg-white p-5 rounded-2xl border border-orange-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-sm font-bold text-slate-800 mb-4">Add New Slot</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
                          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 outline-none focus:border-orange-500 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Time</label>
                          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 outline-none focus:border-orange-500 transition-colors" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                          <button onClick={handleAddSlot} disabled={isPending || isSubmitting} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {isLoadingDay ? (
                      <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>
                    ) : daySlots.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <p className="text-slate-500 font-bold">No slots set</p>
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div key={slot.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-orange-200 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                              {slot.isBooked ? <span className="text-emerald-500">Booked</span> : "Available"}
                            </span>
                            <span className="font-bold text-slate-700">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteSlot(slot.id, slot.isBooked)}
                            disabled={isPending || slot.isBooked}
                            className={`p-2 rounded-lg transition-colors ${slot.isBooked ? 'opacity-30 cursor-not-allowed' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                            title={slot.isBooked ? "Cannot delete booked slot" : "Delete slot"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-4"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
                  <h3 className="text-lg font-bold text-slate-700">Select a Date</h3>
                  <p className="text-slate-500 text-sm mt-2">Click on any date in the calendar to view or manage your available time slots.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
