import 'dotenv/config';
import { sequelize } from '../src/db/index';
import { TutorAvailability, TutorSlotBooking, User } from '../src/db/models';

async function main() {
  console.log('Synchronizing TutorAvailability and TutorSlotBooking tables...');
  try {
    await TutorAvailability.sync({ alter: true });
    console.log('TutorAvailability table updated successfully.');

    await TutorSlotBooking.sync({ alter: true });
    console.log('TutorSlotBooking table created/updated successfully.');

    // Migrate any existing legacy bookings where studentId is set on TutorAvailability
    const legacySlots = await TutorAvailability.findAll({
      where: {
        isBooked: true,
      },
    });

    console.log(`Found ${legacySlots.length} legacy booked slots to check...`);

    for (const slot of legacySlots) {
      if (slot.studentId) {
        const existingBooking = await TutorSlotBooking.findOne({
          where: {
            slotId: slot.id,
            studentId: slot.studentId,
          },
        });

        if (!existingBooking) {
          await TutorSlotBooking.create({
            slotId: slot.id,
            studentId: slot.studentId,
            status: 'SCHEDULED',
          });
          console.log(`Migrated booking for slot ${slot.id} and student ${slot.studentId}`);
        }
      }

      // Update bookedCount
      const count = await TutorSlotBooking.count({
        where: { slotId: slot.id, status: 'SCHEDULED' },
      });

      await slot.update({
        bookedCount: count,
        maxStudents: 100,
        isBooked: count >= 100,
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

main();
