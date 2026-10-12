import { sequelize } from '../src/db/index';

async function run() {
  try {
    await sequelize.authenticate();
    const [cols] = await sequelize.query("SHOW COLUMNS FROM packages LIKE 'benefits';");
    if ((cols as any[]).length === 0) {
      await sequelize.query('ALTER TABLE packages ADD COLUMN benefits JSON NULL;');
      console.log('✅ Successfully added benefits column to packages table');
    } else {
      console.log('ℹ️ Column benefits already exists in packages table');
    }
  } catch (error) {
    console.error('❌ Error adding column:', error);
  } finally {
    process.exit(0);
  }
}

run();
