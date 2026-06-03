import { sequelize } from '../src/db/index';
import '../src/db/models';

async function syncDb() {
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully');
  process.exit(0);
}

syncDb().catch(console.error);
