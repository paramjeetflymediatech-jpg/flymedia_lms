import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../src/db/index';
// Import all models so they are registered with Sequelize before syncing
import '../src/db/models';

async function main() {
  console.log('🔄 Starting live database migration...');
  console.log('This will safely alter tables to match current models without dropping existing data.');
  
  try {
    // alter: true checks the current state of the database and performs 
    // necessary ALTER TABLE or CREATE TABLE queries to match the models, 
    // preserving existing tables and data.
    await sequelize.sync({ alter: true });
    
    console.log('✅ Live database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
