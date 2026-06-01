import dotenv from 'dotenv';
dotenv.config();

import { PasswordResetToken } from '../src/db/models';

async function main() {
  console.log('Creating/altering password_reset_tokens table...');
  await PasswordResetToken.sync({ alter: true });
  console.log('✅ password_reset_tokens table is ready.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
