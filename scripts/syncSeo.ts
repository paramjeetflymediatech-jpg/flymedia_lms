import { SeoSetting } from '../src/db/models';

async function main() {
  console.log('Syncing SeoSetting table...');
  await SeoSetting.sync({ alter: true });
  console.log('Successfully synced SeoSetting table!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
