"use server";

import { requireTutor } from "../../../src/lib/auth";
import { TutorAvailability } from "../../../src/db/models";
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
      attributes: ['id', 'startTime', 'endTime', 'isBooked'],
    });

    return handleResponse(true, "Fetched slots successfully", slots.map(s => s.get({ plain: true })));
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

// Add a new availability slot
export async function addAvailabilitySlot(date: string, startTime: string, endTime: string) {
  try {
    const user = await requireTutor();

    // Basic validation
    if (!date || !startTime || !endTime) {
      return handleResponse(false, "Date, start time, and end time are required");
    }

    // Ensure slot does not already exist
    const existingSlot = await TutorAvailability.findOne({
      where: { tutorId: user.id, date, startTime, endTime }
    });

    if (existingSlot) {
      return handleResponse(false, "This time slot already exists");
    }

    // Check for overlapping slots
    const allSlots = await TutorAvailability.findAll({
      where: { tutorId: user.id, date }
    });

    const isOverlapping = allSlots.some(slot => {
      // Very basic string comparison works for "HH:mm" 24h format
      return (
        (startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime)
      );
    });

    if (isOverlapping) {
      return handleResponse(false, "This time slot overlaps with an existing one");
    }

    const newSlot = await TutorAvailability.create({
      tutorId: user.id,
      date,
      startTime,
      endTime,
      isBooked: false,
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

    if (slot.isBooked) {
      return handleResponse(false, "Cannot delete a time slot that is already booked");
    }

    await slot.destroy();
    
    revalidatePath("/tutor/availability");
    return handleResponse(true, "Slot deleted successfully");
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    return handleResponse(false, "Failed to delete availability slot");
  }
}
