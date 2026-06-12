import 'dotenv/config';
import { sequelize } from '../src/db/index';
import { TutorAvailability } from '../src/db/models';

async function main() {
  console.log('Synchronizing TutorAvailability table...');
  try {
    // This will create the table if it doesn't exist, but won't drop it if it does
    await TutorAvailability.sync({ alter: true });
    console.log('TutorAvailability table created successfully.');
  } catch (error) {
    console.error('Error creating TutorAvailability table:', error);
  } finally {
    process.exit(0);
  }
}

main();
