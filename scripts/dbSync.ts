import mysql from 'mysql2/promise';
import { sequelize } from '../src/db/index';
import { User, Package, LiveClass } from '../src/db/models';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Checking and creating database if not exists (MySQL)...');
  
  // Connect to MySQL server without database first
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
  });
  
  const dbName = process.env.MYSQL_DATABASE || 'my_lms_db';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
  
  // Drop all tables
  const [tables]: any = await connection.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = '${dbName}';
  `);
  
  await connection.query(`USE \`${dbName}\`;`);
  for (const row of tables) {
    const tableName = row.table_name || row.TABLE_NAME;
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
  }
  
  await connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);
  await connection.end();
  
  console.log(`Database "${dbName}" checked/created.`);
  console.log('Synchronizing database schema (MySQL)...');
  
  // Sync all models (warning: force: true drops tables if they exist!)
  await sequelize.sync({ force: true });
  console.log('Database tables successfully synchronized.');

  console.log('Seeding default platform users...');
  
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const tutorPasswordHash = await bcrypt.hash('tutor123', 10);

  const admin = await User.create({
    email: 'admin@company.com',
    name: 'Admin User',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
  });

  const student = await User.create({
    email: 'student@example.com',
    name: 'Jane Doe',
    passwordHash: studentPasswordHash,
    role: 'STUDENT',
  });

  const tutor = await User.create({
    email: 'tutor@example.com',
    name: 'Expert Tutor',
    passwordHash: tutorPasswordHash,
    role: 'TUTOR',
  });

  console.log(`Users seeded: Admin (${admin.email}), Student (${student.email}), Tutor (${tutor.email})`);

  console.log('Seeding Flymedia Tech summer training packages...');

  // Package 1: Digital Marketing
  const package1 = await Package.create({
    title: 'Digital Marketing Specialist Bootcamp',
    slug: 'digital-marketing',
    description: 'Master Search Engine Optimization (SEO), Search Engine Marketing (SEM/Google AdWords), Social Media Marketing (SMO), and Content Strategy. Learn to maximize ROI and execute data-driven campaigns.',
    price: 199.00,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  });

  await LiveClass.create({
    packageId: package1.id,
    tutorId: tutor.id,
    title: 'Intro to Search Engine Mechanics',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 60,
    meetLink: 'https://meet.google.com/abc-defg-hij',
  });

  await LiveClass.create({
    packageId: package1.id,
    tutorId: tutor.id,
    title: 'Conducting Effective Keyword Research',
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // In 2 days
    duration: 90,
    meetLink: 'https://meet.google.com/xyz-uvwx-qwe',
  });

  // Package 2: Web Development
  const package2 = await Package.create({
    title: 'Web Development & Designing Bootcamp',
    slug: 'web-development',
    description: 'Learn to design and build modern websites from scratch. Master HTML5, CSS3, JavaScript, React, Next.js, and database integrations. Build responsive, premium web architectures.',
    price: 299.00,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  });

  await LiveClass.create({
    packageId: package2.id,
    tutorId: tutor.id,
    title: 'Semantic HTML & Tailwind CSS v4',
    startTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
    duration: 120,
    meetLink: 'https://meet.google.com/def-hij-klm',
  });

  console.log('Successfully seeded database with Flymedia packages and live classes!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error synchronizing database:', err);
  process.exit(1);
});
