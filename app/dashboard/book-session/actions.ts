"use server";

import { requireAuth } from "../../../src/lib/auth";
import { User, TutorAvailability, TutorSlotBooking, Enrollment } from "../../../src/db/models";
import { revalidatePath } from "next/cache";
import { Op } from 'sequelize';

// Helper to standardise responses
function handleResponse(success: boolean, message: string, data?: any) {
  return { success, message, data };
}

// 1. Fetch all available tutors
export async function getAllTutors() {
  try {
    await requireAuth(); // Student must be logged in
    const tutors = await User.findAll({
      where: { role: 'TUTOR' },
      attributes: ['id', 'name', 'avatar'],
    });
    return handleResponse(true, "Fetched tutors successfully", tutors.map(t => t.get({ plain: true })));
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return handleResponse(false, "Failed to fetch tutors");
  }
}

// Check if student has any active enrollments
export async function checkStudentEligibility() {
  try {
    const user = await requireAuth();
    const enrollmentCount = await Enrollment.count({
      where: { userId: user.id }
    });
    
    return handleResponse(true, "Checked eligibility", { isEligible: enrollmentCount > 0 });
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return handleResponse(false, "Failed to check eligibility");
  }
}

// 2. Fetch availability slots for an entire month to show indicators on the calendar
export async function getTutorMonthAvailability(tutorId: string, year: number, month: number) {
  try {
    const user = await requireAuth();
    
    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Only look for slots on or after today so previous dates do not show slot indicators
    const queryStartDate = startDate < todayString ? todayString : startDate;

    if (queryStartDate > endDate) {
      // Month is entirely in the past
      return handleResponse(true, "Fetched month slots successfully", []);
    }

    const slots = await TutorAvailability.findAll({
      where: {
        tutorId,
        date: { [Op.between]: [queryStartDate, endDate] },
      },
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          attributes: ['studentId', 'status'],
          required: false,
        },
      ],
      attributes: ['date', 'startTime', 'isBooked', 'bookedCount', 'studentId'],
    });

    // Show indicator if date has slots with available capacity (< 100) OR if it has a slot booked by this student
    const validDates = slots
      .filter(s => {
        const slotDate = s.get('date');
        const slotTime = s.get('startTime');
        const bookings = (s as any).bookings || [];
        const isMyBooking = bookings.some((b: any) => b.studentId === user.id && b.status !== 'CANCELLED') || s.studentId === user.id;

        if (isMyBooking) return true; // Always highlight days where this student booked a session

        const activeBookingsCount = bookings.filter((b: any) => b.status !== 'CANCELLED').length || (s.bookedCount || 0);
        const isFull = activeBookingsCount >= 100;
        if (isFull) return false; // Don't highlight days where slots are 100% full

        if (slotDate === todayString) {
          return slotTime > currentTime;
        }
        return slotDate >= todayString;
      })
      .map(s => s.get('date'));

    const datesWithSlots = [...new Set(validDates)];
    return handleResponse(true, "Fetched month slots successfully", datesWithSlots);
  } catch (error) {
    console.error("Error fetching month availability:", error);
    return handleResponse(false, "Failed to fetch month slots");
  }
}

// 3. Fetch specific time slots for a chosen day
export async function getTutorDayAvailability(tutorId: string, date: string) {
  try {
    const user = await requireAuth();
    const slots = await TutorAvailability.findAll({
      where: { tutorId, date },
      order: [['startTime', 'ASC']],
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          attributes: ['studentId', 'status'],
          required: false,
        },
      ],
      attributes: ['id', 'startTime', 'endTime', 'date', 'isBooked', 'bookedCount', 'maxStudents', 'studentId'],
    });

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const formattedSlots = slots.map(s => {
      const plain = s.get({ plain: true });
      const slotDate = plain.date || date;
      const isPast = slotDate < todayString || (slotDate === todayString && plain.startTime <= currentTime);
      
      const bookings = (plain as any).bookings || [];
      const activeBookings = bookings.filter((b: any) => b.status !== 'CANCELLED');
      const bookedCount = activeBookings.length > 0 ? activeBookings.length : (plain.bookedCount || 0);
      const isBookedByMe = Boolean(
        activeBookings.some((b: any) => b.studentId === user.id) || plain.studentId === user.id
      );
      const isFull = bookedCount >= 100;
      const availableSeats = Math.max(0, 100 - bookedCount);

      return {
        id: plain.id,
        startTime: plain.startTime,
        endTime: plain.endTime,
        date: slotDate,
        isBooked: isFull,
        isBookedByMe,
        isPast,
        bookedCount,
        maxStudents: 100,
        availableSeats,
      };
    });

    return handleResponse(true, "Fetched day slots successfully", formattedSlots);
  } catch (error) {
    console.error("Error fetching day availability:", error);
    return handleResponse(false, "Failed to fetch day slots");
  }
}

// 4. Book a slot (Supports up to 100 students)
export async function bookSessionSlot(slotId: string) {
  try {
    const user = await requireAuth(); // The student booking the session
    
    // Fetch the slot first to check the time
    const slot = await TutorAvailability.findByPk(slotId);
    if (!slot) {
      return handleResponse(false, "Slot not found");
    }

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    if (slot.date < todayString) {
      return handleResponse(false, "Cannot book sessions in the past");
    }

    if (slot.date === todayString) {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (slot.startTime <= currentTime) {
        return handleResponse(false, "Cannot book sessions that have already started");
      }
    }

    // Check if student has already booked this slot
    const existingBooking = await TutorSlotBooking.findOne({
      where: {
        slotId,
        studentId: user.id,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    if (existingBooking || slot.studentId === user.id) {
      return handleResponse(false, "You have already booked this session.");
    }

    // Check current bookings count (Max 100 students)
    const currentCount = await TutorSlotBooking.count({
      where: {
        slotId,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    if (currentCount >= 100) {
      return handleResponse(false, "This session is fully booked (maximum 100 students reached).");
    }

    // Create booking record
    await TutorSlotBooking.create({
      slotId,
      studentId: user.id,
      status: 'SCHEDULED',
    });

    const newCount = currentCount + 1;
    await slot.update({
      bookedCount: newCount,
      isBooked: newCount >= 100,
      studentId: slot.studentId || user.id,
    });

    revalidatePath("/dashboard/book-session");
    revalidatePath("/dashboard/courses");
    return handleResponse(true, "Session booked successfully!");
  } catch (error: any) {
    console.error("Error booking session:", error);
    return handleResponse(false, error.message || "Failed to book session");
  }
}

