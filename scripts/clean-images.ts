import { Category, Package, Testimonial, User } from '../src/db/models';
import fs from 'fs';
import path from 'path';

async function cleanBrokenImages() {
  console.log('Cleaning broken image paths from database...');
  
  // 1. Categories
  const categories = await Category.findAll();
  for (const cat of categories) {
    if (cat.icon && cat.icon.startsWith('/uploads')) {
      const filePath = path.join(process.cwd(), 'public', cat.icon);
      if (!fs.existsSync(filePath)) {
        console.log(`Missing file: ${filePath}, clearing category icon for ${cat.name}`);
        cat.icon = null;
        await cat.save();
      }
    }
  }

  // 2. Packages
  const packages = await Package.findAll();
  for (const pkg of packages) {
    if (pkg.thumbnail && pkg.thumbnail.startsWith('/uploads')) {
      const filePath = path.join(process.cwd(), 'public', pkg.thumbnail);
      if (!fs.existsSync(filePath)) {
        console.log(`Missing file: ${filePath}, clearing package thumbnail for ${pkg.title}`);
        pkg.thumbnail = null;
        await pkg.save();
      }
    }
  }

  // 3. Testimonials
  const testimonials = await Testimonial.findAll();
  for (const test of testimonials) {
    if (test.avatar && test.avatar.startsWith('/uploads')) {
      const filePath = path.join(process.cwd(), 'public', test.avatar);
      if (!fs.existsSync(filePath)) {
        console.log(`Missing file: ${filePath}, clearing testimonial avatar for ${test.name}`);
        test.avatar = null;
        await test.save();
      }
    }
  }

  console.log('Finished cleaning broken images!');
  process.exit(0);
}

cleanBrokenImages().catch(err => {
  console.error(err);
  process.exit(1);
});
