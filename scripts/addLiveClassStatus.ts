import { sequelize } from '../src/db/index';

async function main() {
  try {
    await sequelize.query("ALTER TABLE live_classes ADD COLUMN status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED';");
    console.log("Successfully added status column to live_classes");
  } catch (error) {
    console.error("Error adding column (it might already exist):", error);
  }
  process.exit(0);
}

main();
