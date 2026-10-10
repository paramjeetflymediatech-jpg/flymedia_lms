import { Faq } from '../src/db/models';

async function main() {
  console.log('Syncing Faq table...');
  await Faq.sync({ alter: true });
  console.log('Faq table created and synced.');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
