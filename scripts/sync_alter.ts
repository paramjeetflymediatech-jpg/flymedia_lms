import { sequelize } from '../src/db/index';
import '../src/db/models';

async function main() {
  console.log('Altering database schema...');
  await sequelize.sync({ alter: true });
  console.log('Database altered successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to alter db:', err);
  process.exit(1);
});
