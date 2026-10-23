import { sequelize } from '../src/db/index';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('🔄 Checking users table columns...');

    const columnsToAdd = [
      { name: 'phone', type: 'VARCHAR(255) NULL' },
      { name: 'educationDetails', type: 'JSON NULL' },
      { name: 'addressDetails', type: 'JSON NULL' },
      { name: 'familyDetails', type: 'JSON NULL' },
      { name: 'studentCategory', type: 'VARCHAR(255) NULL' },
    ];

    for (const col of columnsToAdd) {
      const [existing] = await sequelize.query(`SHOW COLUMNS FROM \`users\` LIKE '${col.name}';`);
      if ((existing as any[]).length === 0) {
        console.log(`➕ Adding column ${col.name}...`);
        await sequelize.query(`ALTER TABLE \`users\` ADD COLUMN \`${col.name}\` ${col.type};`);
        console.log(`✅ Column ${col.name} added successfully.`);
      } else {
        console.log(`ℹ️ Column ${col.name} already exists.`);
      }
    }

    console.log('🎉 All user profile columns verified and ready!');
  } catch (error) {
    console.error('❌ Error updating users table:', error);
  } finally {
    process.exit(0);
  }
}

run();
