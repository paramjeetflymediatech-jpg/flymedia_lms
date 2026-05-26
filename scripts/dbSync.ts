import mysql from 'mysql2/promise';
import { sequelize } from '../src/db/index';
import { User, Course, Module, Lesson } from '../src/db/models';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Checking and creating database if not exists (MySQL)...');
  
  // Connect to MySQL server without database first
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Root@123',
  });
  
  const dbName = process.env.MYSQL_DATABASE || 'my_lms_db';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.end();
  
  console.log(`Database "${dbName}" checked/created.`);
  console.log('Synchronizing database schema (MySQL)...');
  
  // Sync all models (warning: force: true drops tables if they exist!)
  await sequelize.sync({ force: true });
  console.log('Database tables successfully synchronized.');

  console.log('Seeding default platform users...');
  
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  const admin = await User.create({
    email: 'admin@company.com',
    name: 'Admin Instructor',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
  });

  const student = await User.create({
    email: 'student@example.com',
    name: 'Jane Doe',
    passwordHash: studentPasswordHash,
    role: 'STUDENT',
  });

  console.log(`Users seeded: Admin (${admin.email}), Student (${student.email})`);

  console.log('Seeding Flymedia Tech summer training courses...');

  // Course 1: Digital Marketing
  const course1 = await Course.create({
    title: 'Digital Marketing Specialist Bootcamp',
    slug: 'digital-marketing',
    description: 'Master Search Engine Optimization (SEO), Search Engine Marketing (SEM/Google AdWords), Social Media Marketing (SMO), and Content Strategy. Learn to maximize ROI and execute data-driven campaigns.',
    duration: 1800, // 30 hours (1 hr daily)
    level: 'BEGINNER',
    price: 199.00,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  });

  const m1_c1 = await Module.create({
    courseId: course1.id,
    title: 'Module 1: SEO & Keyword Optimization',
    order: 1,
  });

  await Lesson.create({
    moduleId: m1_c1.id,
    title: '1.1 Introduction to Search Engine Mechanics',
    type: 'TEXT',
    content: `### Understanding Search Engines
Search engines crawl, index, and rank web pages to provide relevant results.
- Crawling: Search engine bots discover web pages.
- Indexing: Discovered pages are analyzed and cataloged.
- Ranking: Pages are ordered based on relevancy indicators.`,
    order: 1,
  });

  await Lesson.create({
    moduleId: m1_c1.id,
    title: '1.2 Conducting Effective Keyword Research',
    type: 'VIDEO',
    content: 'https://www.w3schools.com/html/mov_bbb.mp4',
    order: 2,
  });


  // Course 2: Web Development
  const course2 = await Course.create({
    title: 'Web Development & Designing Bootcamp',
    slug: 'web-development',
    description: 'Learn to design and build modern websites from scratch. Master HTML5, CSS3, JavaScript, React, Next.js, and database integrations. Build responsive, premium web architectures.',
    duration: 2400, // 40 hours
    level: 'INTERMEDIATE',
    price: 299.00,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  });

  const m1_c2 = await Module.create({
    courseId: course2.id,
    title: 'Module 1: Semantic HTML & Tailwind CSS v4',
    order: 1,
  });

  await Lesson.create({
    moduleId: m1_c2.id,
    title: '1.1 Designing Layouts with Flexbox and CSS Grid',
    type: 'TEXT',
    content: `### Layout Frameworks
Use CSS flexbox for one-dimensional layouts, and CSS grid for two-dimensional grids.
- \`display: flex\` aligns children along rows or columns.
- \`display: grid\` maps elements into configurable cells.`,
    order: 1,
  });


  // Course 3: Video Editing
  const course3 = await Course.create({
    title: 'Professional Video Editing & Motion Graphics',
    slug: 'video-editing',
    description: 'Master non-linear storytelling, timelines, sound mixing, and transitions using Adobe Premiere Pro and After Effects. Learn content styling optimized for social channels.',
    duration: 1800,
    level: 'BEGINNER',
    price: 149.00,
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  });

  const m1_c3 = await Module.create({
    courseId: course3.id,
    title: 'Module 1: Timeline Mechanics & Storytelling',
    order: 1,
  });

  await Lesson.create({
    moduleId: m1_c3.id,
    title: '1.1 Organizing Media Assets & Working with B-Rolls',
    type: 'TEXT',
    content: `### Timeline Organization
Keep folders for raw footages, audio overlays, and graphics structured in Premiere.
- Track 1: Main narrative A-roll.
- Track 2: Supporting B-roll clips.
- Audio 1: Voiceovers.
- Audio 2: Ambient soundtrack.`,
    order: 1,
  });


  // Course 4: Graphic Designing
  const course4 = await Course.create({
    title: 'Creative Graphic Designing & UI/UX',
    slug: 'graphic-designing',
    description: 'Learn vector illustration, photo retouching, print asset creation, and layout rules using Photoshop, Illustrator, and Figma. Establish clear brand guidelines.',
    duration: 1800,
    level: 'BEGINNER',
    price: 149.00,
    thumbnail: 'https://images.unsplash.com/photo-1541462608141-2ffb68a68266?auto=format&fit=crop&w=800&q=80',
  });

  const m1_c4 = await Module.create({
    courseId: course4.id,
    title: 'Module 1: Typography and Color Theory',
    order: 1,
  });

  await Lesson.create({
    moduleId: m1_c4.id,
    title: '1.1 Understanding Primary Color Haromonies & Contrast',
    type: 'TEXT',
    content: `### Color Theory
Use complementary and analogous schemes to establish a visual hierarchy.
- Contrast: Ensure font readability against background shades.
- Warm colors (Orange, Red) represent action and excitement.`,
    order: 1,
  });

  console.log('Successfully seeded database with Flymedia courses!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error synchronizing database:', err);
  process.exit(1);
});
