import { sequelize } from '../src/db/index';

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE packages ADD COLUMN duration VARCHAR(50) DEFAULT "6 Months";');
    console.log('Successfully added duration column to packages table');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    process.exit(0);
  }
}

run();
