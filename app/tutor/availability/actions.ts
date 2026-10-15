"use server";

import { requireTutor } from "../../../src/lib/auth";
import { TutorAvailability, TutorSlotBooking, User } from "../../../src/db/models";
import { revalidatePath } from "next/cache";
import { Op } from 'sequelize';

// Helper to standardise responses
function handleResponse(success: boolean, message: string, data?: any) {
  return { success, message, data };
}

// Fetch availability slots for a specific date
export async function getAvailabilitySlots(date: string) {
  try {
    const user = await requireTutor();
    const slots = await TutorAvailability.findAll({
      where: { tutorId: user.id, date },
      order: [['startTime', 'ASC']],
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          attributes: ['id', 'status', 'createdAt'],
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'email', 'avatar'],
            },
          ],
          required: false,
        },
      ],
      attributes: ['id', 'startTime', 'endTime', 'isBooked', 'bookedCount', 'maxStudents'],
    });

    const formatted = slots.map(s => {
      const plain = s.get({ plain: true });
      const bookings = (plain as any).bookings || [];
      const activeBookings = bookings.filter((b: any) => b.status !== 'CANCELLED');
      const count = activeBookings.length > 0 ? activeBookings.length : (plain.bookedCount || 0);
      const students = activeBookings.map((b: any) => ({
        id: b.student?.id || b.id,
        name: b.student?.name || 'Student',
        email: b.student?.email || '',
        avatar: b.student?.avatar || null,
        bookedAt: b.createdAt,
      }));

      return {
        id: plain.id,
        startTime: plain.startTime,
        endTime: plain.endTime,
        bookedCount: count,
        maxStudents: 100,
        isBooked: count >= 100,
        students,
      };
    });

    return handleResponse(true, "Fetched slots successfully", formatted);
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return handleResponse(false, "Failed to fetch availability slots");
  }
}

// Fetch availability slots for an entire month to show indicators
export async function getMonthAvailabilitySlots(year: number, month: number) {
  try {
    const user = await requireTutor();
    
    // Construct start and end dates for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const slots = await TutorAvailability.findAll({
      where: {
        tutorId: user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['date'],
    });

    // Extract unique dates that have slots
    const datesWithSlots = [...new Set(slots.map(s => s.get('date')))];

    return handleResponse(true, "Fetched month slots successfully", datesWithSlots);
  } catch (error) {
    console.error("Error fetching month availability slots:", error);
    return handleResponse(false, "Failed to fetch month slots");
  }
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const clean = timeStr.trim().split(' ')[0];
  const parts = clean.split(':');
  if (parts.length < 2) return -1;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Add a new availability slot
export async function addAvailabilitySlot(date: string, startTime: string, endTime: string) {
  try {
    const user = await requireTutor();

    // Basic validation
    if (!date || !startTime || !endTime) {
      return handleResponse(false, "Date, start time, and end time are required");
    }

    const newStartMinutes = parseTimeToMinutes(startTime);
    const newEndMinutes = parseTimeToMinutes(endTime);

    if (newStartMinutes < 0 || newEndMinutes < 0) {
      return handleResponse(false, "Invalid time format. Please provide time as HH:mm (e.g. 10:00)");
    }

    if (newStartMinutes >= newEndMinutes) {
      return handleResponse(false, "End time must be after start time");
    }

    const normalizedStartTime = formatMinutesToTime(newStartMinutes);
    const normalizedEndTime = formatMinutesToTime(newEndMinutes);

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const minLeadMinutes = 120; // Must be at least 2 hours in advance

    if (date < todayString) {
      return handleResponse(false, "Cannot add availability for past dates");
    }

    if (date === todayString) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const minAllowedStart = currentMinutes + minLeadMinutes;
      if (newStartMinutes < minAllowedStart) {
        const earliestTime = formatMinutesToTime(Math.min(23 * 60 + 59, minAllowedStart));
        return handleResponse(
          false,
          `Slot starting time must be at least 2 hours in advance. Earliest start time allowed today is ${earliestTime}.`
        );
      }
    }

    // Check for overlapping active slots on the same date for this tutor
    const allSlots = await TutorAvailability.findAll({
      where: {
        tutorId: user.id,
        date,
        status: { [Op.ne]: 'CANCELLED' },
      }
    });

    const overlappingSlot = allSlots.find(slot => {
      const slotStart = parseTimeToMinutes(slot.startTime);
      const slotEnd = parseTimeToMinutes(slot.endTime);
      if (slotStart < 0 || slotEnd < 0) return false;

      // Intervals [newStart, newEnd) and [slotStart, slotEnd) overlap if:
      return newStartMinutes < slotEnd && newEndMinutes > slotStart;
    });

    if (overlappingSlot) {
      return handleResponse(
        false,
        `This time slot (${normalizedStartTime} - ${normalizedEndTime}) overlaps with an existing slot (${overlappingSlot.startTime} - ${overlappingSlot.endTime})`
      );
    }

    const newSlot = await TutorAvailability.create({
      tutorId: user.id,
      date,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      isBooked: false,
      status: 'SCHEDULED',
    });

    revalidatePath("/tutor/availability");
    return handleResponse(true, "Slot added successfully", newSlot.get({ plain: true }));
  } catch (error) {
    console.error("Error adding availability slot:", error);
    return handleResponse(false, "Failed to add availability slot");
  }
}

// Delete an availability slot
export async function deleteAvailabilitySlot(slotId: string) {
  try {
    const user = await requireTutor();
    
    const slot = await TutorAvailability.findOne({
      where: { id: slotId, tutorId: user.id }
    });

    if (!slot) {
      return handleResponse(false, "Time slot not found");
    }

    const bookingsCount = await TutorSlotBooking.count({
      where: { slotId, status: { [Op.ne]: 'CANCELLED' } },
    });

    if (bookingsCount > 0 || (slot.bookedCount && slot.bookedCount > 0)) {
      return handleResponse(false, `Cannot delete slot: ${bookingsCount || slot.bookedCount} student(s) have already booked it.`);
    }

    await slot.destroy();
    
    revalidatePath("/tutor/availability");
    return handleResponse(true, "Slot deleted successfully");
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    return handleResponse(false, "Failed to delete availability slot");
  }
}
