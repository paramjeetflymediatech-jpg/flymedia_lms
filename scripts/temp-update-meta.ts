import { Category } from '../src/db/models';
import { sequelize } from '../src/db';

async function run() {
  await sequelize.authenticate();
  const categories = await Category.findAll();
  for (const cat of categories) {
    if (!cat.metaDescription || cat.metaDescription.trim() === '') {
      await cat.update({ metaDescription: 'Advance your career with our industry-leading ' + cat.name + ' training programs and certifications.' });
      console.log('Updated ' + cat.name);
    }
  }
  process.exit(0);
}
run();
