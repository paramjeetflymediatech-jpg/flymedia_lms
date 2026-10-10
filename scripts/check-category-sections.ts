import { Category } from '../src/db/models';
import { sequelize } from '../src/db/index';

async function run() {
  await sequelize.authenticate();
  const cat = await Category.findOne({ where: { slug: 'graphic-design' } });
  if (cat) {
    const content = JSON.parse(cat.content as string);
    console.log(content.sections[0]);
  }
}
run().catch(console.error).finally(() => process.exit(0));
