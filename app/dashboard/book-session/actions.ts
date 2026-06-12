"use server";

import { requireAuth } from "../../../src/lib/auth";
import { User, TutorAvailability, Enrollment } from "../../../src/db/models";
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
    await requireAuth();
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const slots = await TutorAvailability.findAll({
      where: {
        tutorId,
        date: { [Op.between]: [startDate, endDate] },
        isBooked: false // Only show indicators for days that have UNBOOKED slots
      },
      attributes: ['date'],
    });

    const datesWithSlots = [...new Set(slots.map(s => s.get('date')))];
    return handleResponse(true, "Fetched month slots successfully", datesWithSlots);
  } catch (error) {
    console.error("Error fetching month availability:", error);
    return handleResponse(false, "Failed to fetch month slots");
  }
}

// 3. Fetch specific unbooked time slots for a chosen day
export async function getTutorDayAvailability(tutorId: string, date: string) {
  try {
    await requireAuth();
    const slots = await TutorAvailability.findAll({
      where: { tutorId, date, isBooked: false },
      order: [['startTime', 'ASC']],
      attributes: ['id', 'startTime', 'endTime'],
    });

    return handleResponse(true, "Fetched day slots successfully", slots.map(s => s.get({ plain: true })));
  } catch (error) {
    console.error("Error fetching day availability:", error);
    return handleResponse(false, "Failed to fetch day slots");
  }
}

// 4. Book a slot
export async function bookSessionSlot(slotId: string) {
  try {
    const user = await requireAuth(); // The student booking the session
    
    // Use a transaction or simply do an atomic update to prevent double-booking
    const [affectedRows] = await TutorAvailability.update(
      { isBooked: true, studentId: user.id },
      { 
        where: { 
          id: slotId, 
          isBooked: false // Important: Only update if it's currently NOT booked
        } 
      }
    );

    if (affectedRows === 0) {
      return handleResponse(false, "This slot is no longer available.");
    }

    revalidatePath("/dashboard/book-session");
    return handleResponse(true, "Session booked successfully!");
  } catch (error) {
    console.error("Error booking session:", error);
    return handleResponse(false, "Failed to book session");
  }
}
