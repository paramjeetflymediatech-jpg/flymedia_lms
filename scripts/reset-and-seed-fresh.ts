import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/db/index';
import {
  User,
  Package,
  Category,
  LiveClass,
  Enrollment,
  PackageTutor,
  ClassSchedule,
  ClassAttendance,
  Testimonial,
  Faq,
  BlogPost,
} from '../src/db/models';

async function main() {
  console.log('🔄 ==============================================');
  console.log('🗑️  DROPPING DATABASE TABLES & PREPARING FRESH DB');
  console.log('🔄 ==============================================');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
  });

  const dbName = process.env.MYSQL_DATABASE || 'my_lms_db';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);

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

  console.log(`✅ All tables in "${dbName}" dropped cleanly.`);

  // Sync schema fresh with all models
  console.log('📦 Recreating schema tables with Sequelize sync...');
  await sequelize.sync({ force: true });
  console.log('✅ All tables synchronized successfully!');

  // ==========================================
  // 1. SEED USERS
  // ==========================================
  console.log('\n🧑‍💻 Seeding Platform Users...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const tutorPasswordHash = await bcrypt.hash('tutor123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // Admin
  const admin = await User.create({
    email: 'admin@company.com',
    name: 'Platform Administrator',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
  });

  // Tutor 1: Web Development & MERN
  const tutorWeb = await User.create({
    email: 'tutor.web@flymedia.com',
    name: 'Vikram Malhotra',
    passwordHash: tutorPasswordHash,
    role: 'TUTOR',
    professionTitle: 'Lead Full Stack & Next.js Mentor',
    bio: '8+ years of industry experience architecting scalable React & Node.js web applications. Passionate about hands-on coding and modern web engineering.',
    rating: 4.9,
    reviewsCount: 142,
    studentsMentored: 520,
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'MongoDB', 'MySQL'],
  });

  // Tutor 2: Video Editing & Graphic Design
  const tutorVideo = await User.create({
    email: 'tutor.video@flymedia.com',
    name: 'Neha Kapoor',
    passwordHash: tutorPasswordHash,
    role: 'TUTOR',
    professionTitle: 'Creative Director & Video Editing Specialist',
    bio: 'Senior Motion Designer and Post-Production Lead. Edited commercials, YouTube series, and documentary films using Premiere Pro and After Effects.',
    rating: 5.0,
    reviewsCount: 98,
    studentsMentored: 340,
    skills: ['Adobe Premiere Pro', 'After Effects', 'Photoshop', 'Color Grading', 'Sound Design'],
  });

  // Student
  const student = await User.create({
    email: 'student@example.com',
    name: 'Aman Sharma',
    passwordHash: studentPasswordHash,
    role: 'STUDENT',
  });

  console.log(`✅ Users created:`);
  console.log(`   - Admin: ${admin.email} (Password: admin123)`);
  console.log(`   - Tutor 1: ${tutorWeb.email} (Password: tutor123)`);
  console.log(`   - Tutor 2: ${tutorVideo.email} (Password: tutor123)`);
  console.log(`   - Student: ${student.email} (Password: student123)`);

  // ==========================================
  // 2. SEED CATEGORIES
  // ==========================================
  console.log('\n🏷️  Seeding Categories...');
  const catWeb = await Category.create({
    name: 'Web Development',
    slug: 'web-development',
    icon: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png',
    metaTitle: 'Web Development Training & Live Bootcamps',
    metaDescription: 'Master front-end and back-end web development with hands-on live classes.',
  });

  const catVideo = await Category.create({
    name: 'Video Editing',
    slug: 'video-editing',
    icon: 'https://cdn-icons-png.flaticon.com/512/2824/2824810.png',
    metaTitle: 'Professional Video Editing Courses & Training',
    metaDescription: 'Learn Premiere Pro, After Effects, and cinematic editing techniques.',
  });

  const catMern = await Category.create({
    name: 'MERN Stack Developer',
    slug: 'mern-stack-developer',
    icon: 'https://cdn-icons-png.flaticon.com/512/919/919851.png',
    metaTitle: 'MERN Stack Developer Career Track',
    metaDescription: 'Comprehensive full-stack developer program covering MongoDB, Express, React, and Node.js.',
  });

  const catDesign = await Category.create({
    name: 'Graphic Design',
    slug: 'graphic-design',
    icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png',
    metaTitle: 'Graphic Design & Creative UI Courses',
    metaDescription: 'Master visual branding, digital illustrations, and typography.',
  });

  const catMarketing = await Category.create({
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    icon: 'https://cdn-icons-png.flaticon.com/512/1998/1998087.png',
    metaTitle: 'Digital Marketing Specialist Certification',
    metaDescription: 'Learn SEO, SEM, performance marketing, and social media campaigns.',
  });

  console.log('✅ Categories created: Web Dev, Video Editing, MERN, Graphic Design, Digital Marketing.');

  // ==========================================
  // 3. SEED PACKAGES
  // ==========================================
  console.log('\n🎓 Seeding Packages...');

  const pkgWeb = await Package.create({
    title: 'Web Development & Designing Bootcamp',
    slug: 'web-development',
    description: 'Learn modern responsive web development from scratch. Build dynamic websites using HTML5, modern CSS, JavaScript, and Next.js with database integration.',
    category: 'Web Development',
    price: 4999.0,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    mode: 'ONLINE',
    status: 'PUBLISHED',
    totalClasses: 12,
    rating: 4.9,
    reviewsCount: '1.2k+',
    level: 'Beginner to Advanced',
    duration: '12 Classes (6 Weeks)',
    whatYoullLearn: [
      'Semantic HTML5 structure & modern CSS3 flexbox/grid layout',
      'JavaScript ES6+ fundamentals, DOM manipulation & async APIs',
      'React components, state management & hooks architecture',
      'Building complete full-stack web applications with Next.js',
      'Connecting to MySQL and MongoDB databases securely',
      'Git version control and deploying live projects on cloud servers',
    ],
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Next.js', 'MySQL', 'Git'],
    techStack: ['JavaScript', 'React', 'Node.js', 'Next.js', 'MySQL', 'TailwindCSS'],
  });

  const pkgVideo = await Package.create({
    title: 'Professional Video Editing & Motion Graphics',
    slug: 'video-editing',
    description: 'Master non-linear video editing with Adobe Premiere Pro and visual effects in After Effects. Learn cinematic storytelling, audio design, and social media video creation.',
    category: 'Video Editing',
    price: 3999.0,
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    mode: 'ONLINE',
    status: 'PUBLISHED',
    totalClasses: 12,
    rating: 5.0,
    reviewsCount: '850+',
    level: 'Beginner to Professional',
    duration: '12 Classes (6 Weeks)',
    whatYoullLearn: [
      'Timeline management and non-linear editing in Premiere Pro',
      'Color grading with Lumetri Color and custom LUTs',
      'Audio mastering, noise reduction and Foley sound design',
      'Keyframing, kinetic typography and titles in After Effects',
      'Visual effects (VFX), masking, and green-screen compositing',
      'Exporting high-quality renders for YouTube, Reels, and film festivals',
    ],
    skills: ['Adobe Premiere Pro', 'Adobe After Effects', 'Color Grading', 'Sound Design', 'Motion Graphics'],
    techStack: ['Premiere Pro', 'After Effects', 'Audition', 'Photoshop'],
  });

  const pkgMern = await Package.create({
    title: 'Full Stack MERN Developer Program with AI',
    slug: 'mern-stack-developer-program',
    description: 'Become a job-ready full-stack engineer. Master MongoDB, Express, React, and Node.js, and integrate AI APIs like OpenAI and Google Gemini into web applications.',
    category: 'MERN Stack Developer',
    price: 14999.0,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    mode: 'BOTH',
    status: 'PUBLISHED',
    totalClasses: 12,
    rating: 4.9,
    reviewsCount: '920+',
    level: 'Intermediate to Advanced',
    duration: '12 Classes (6 Weeks)',
    whatYoullLearn: [
      'Advanced React, Redux Toolkit state management & server rendering',
      'RESTful & GraphQL API development with Node.js and Express',
      'Schema design, indexing and aggregation pipelines in MongoDB',
      'JWT authentication, OAuth login, and role-based access control',
      'Integrating LLM APIs (OpenAI, Gemini) for AI-driven automation',
      'Deploying microservices and database clusters to production',
    ],
    skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'TypeScript', 'AI APIs', 'Docker'],
    techStack: ['MongoDB', 'Express', 'React', 'Node.js', 'Docker', 'AWS'],
  });

  const pkgDesign = await Package.create({
    title: 'Creative Graphic Design & UI/UX Bootcamp',
    slug: 'graphic-design',
    description: 'Learn visual communication, brand identity design, and UI wireframing with Photoshop, Illustrator, and Figma. Build an impressive portfolio of real client work.',
    category: 'Graphic Design',
    price: 3499.0,
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    mode: 'ONLINE',
    status: 'PUBLISHED',
    totalClasses: 12,
    rating: 4.8,
    reviewsCount: '640+',
    level: 'Beginner to Intermediate',
    duration: '12 Classes (6 Weeks)',
  });

  const pkgMarketing = await Package.create({
    title: 'Digital Marketing & Growth Specialist',
    slug: 'digital-marketing',
    description: 'Scale businesses online. Master Search Engine Optimization (SEO), Google Search & Display Ads, Meta Ads Manager, and growth hacking strategies.',
    category: 'Digital Marketing',
    price: 2999.0,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    mode: 'ONLINE',
    status: 'PUBLISHED',
    totalClasses: 12,
    rating: 4.9,
    reviewsCount: '780+',
    level: 'All Levels',
    duration: '12 Classes (6 Weeks)',
  });

  console.log('✅ 5 Training packages created (12 classes each).');

  // ==========================================
  // 4. ASSIGN TUTORS TO MULTIPLE PACKAGES
  // ==========================================
  console.log('\n🔗 Assigning Tutors to Multiple Packages (PackageTutor)...');

  // Vikram Malhotra -> Web Development & MERN Stack
  await PackageTutor.bulkCreate([
    { packageId: pkgWeb.id, tutorId: tutorWeb.id },
    { packageId: pkgMern.id, tutorId: tutorWeb.id },
  ]);

  // Neha Kapoor -> Video Editing & Graphic Design
  await PackageTutor.bulkCreate([
    { packageId: pkgVideo.id, tutorId: tutorVideo.id },
    { packageId: pkgDesign.id, tutorId: tutorVideo.id },
  ]);

  console.log('✅ Tutor assignments created:');
  console.log('   - Vikram Malhotra assigned to: Web Development & MERN Stack');
  console.log('   - Neha Kapoor assigned to: Video Editing & Graphic Design');

  // ==========================================
  // 5. SEED RECURRING SCHEDULES & 12 CLASSES
  // ==========================================
  console.log('\n📅 Creating Recurring Schedules & Generating 12 Classes...');

  // Schedule 1: Web Development (Every Mon & Wed at 18:00)
  const meetWeb = 'https://meet.google.com/fly-web-dev';
  const scheduleWeb = await ClassSchedule.create({
    packageId: pkgWeb.id,
    tutorId: tutorWeb.id,
    daysOfWeek: ['Monday', 'Wednesday'],
    startTime: '18:00',
    duration: 60,
    meetLink: meetWeb,
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), // Started 1 week ago
    totalClasses: 12,
    status: 'ACTIVE',
  });

  // Generate 12 sequential classes for Web Development
  // Class 1 & 2 conducted in past; Class 3 to 12 scheduled for future
  const webClassesToCreate: any[] = [];
  const baseWeb = new Date(Date.now() - 7 * 86400000);
  baseWeb.setHours(18, 0, 0, 0);

  const webTopics = [
    'HTML5 Semantic Markup & Accessibility',
    'Modern CSS Grid, Flexbox & Responsive Layouts',
    'JavaScript Foundations, Scope & Functions',
    'DOM Manipulation & Interactive UI Events',
    'Asynchronous JS, Fetch API & JSON Handling',
    'React Component Architecture & Props',
    'React State Hooks (useState & useEffect)',
    'Next.js App Router, Pages & Layouts',
    'Building Dynamic Route Handlers & Server Actions',
    'Database Modelling & Querying with MySQL',
    'User Authentication & Protected Dashboards',
    'Production Deployment & Capstone Project Review',
  ];

  for (let i = 1; i <= 12; i++) {
    const classDate = new Date(baseWeb);
    classDate.setDate(baseWeb.getDate() + (i - 1) * 3); // every 3-4 days
    webClassesToCreate.push({
      packageId: pkgWeb.id,
      tutorId: tutorWeb.id,
      scheduleId: scheduleWeb.id,
      classNumber: i,
      title: `${pkgWeb.title} - Class ${i}: ${webTopics[i - 1]}`,
      meetLink: meetWeb,
      startTime: classDate,
      duration: 60,
      status: 'SCHEDULED',
    });
  }

  const createdWebClasses = await LiveClass.bulkCreate(webClassesToCreate);
  console.log(`✅ Web Development: 12 sequential Live Classes created.`);

  // Schedule 2: Video Editing (Every Tue & Thu at 19:00)
  const meetVideo = 'https://meet.google.com/fly-vid-edit';
  const scheduleVideo = await ClassSchedule.create({
    packageId: pkgVideo.id,
    tutorId: tutorVideo.id,
    daysOfWeek: ['Tuesday', 'Thursday'],
    startTime: '19:00',
    duration: 60,
    meetLink: meetVideo,
    startDate: new Date().toISOString().slice(0, 10),
    totalClasses: 12,
    status: 'ACTIVE',
  });

  const videoTopics = [
    'Introduction to Video Editing & Premiere Pro Workspace',
    'Media Ingestion, Organizing B-Roll & Assembly Cuts',
    'Rough Cut to Fine Cut: Pacing and Story Arc',
    'Advanced Trimming, Ripple Edits & Speed Ramping',
    'Audio Cleanup, Equalization & Sound Design',
    'Color Correction and Creative Color Grading (LUTs)',
    'After Effects Basics: Dynamic Link & Compositions',
    'Motion Graphics, Kinetic Typography & Lower Thirds',
    'Masking, Rotoscoping & Green Screen Keying',
    'Transitions, Glitch Effects & Sound Sync',
    'Export Settings for Social Media, YouTube & Cinema',
    'Final Portfolio Review & Client Deliverable Preparation',
  ];

  const videoClassesToCreate: any[] = [];
  const baseVideo = new Date();
  baseVideo.setHours(19, 0, 0, 0);

  for (let i = 1; i <= 12; i++) {
    const classDate = new Date(baseVideo);
    classDate.setDate(baseVideo.getDate() + (i * 3));
    videoClassesToCreate.push({
      packageId: pkgVideo.id,
      tutorId: tutorVideo.id,
      scheduleId: scheduleVideo.id,
      classNumber: i,
      title: `${pkgVideo.title} - Class ${i}: ${videoTopics[i - 1]}`,
      meetLink: meetVideo,
      startTime: classDate,
      duration: 60,
      status: 'SCHEDULED',
    });
  }

  await LiveClass.bulkCreate(videoClassesToCreate);
  console.log(`✅ Video Editing: 12 sequential Live Classes created.`);

  // ==========================================
  // 6. SEED STUDENT ENROLLMENT & ATTENDANCE
  // ==========================================
  console.log('\n📝 Enrolling Demo Student in Web Development & Recording Attendance...');

  const enrollment = await Enrollment.create({
    userId: student.id,
    packageId: pkgWeb.id,
    totalClasses: 12,
    conductedClasses: 2,
    attendedClasses: 2,
    status: 'ACTIVE',
  });

  // Record attendance for the 2 past classes
  const pastWebClasses = createdWebClasses.slice(0, 2);
  for (const c of pastWebClasses) {
    await ClassAttendance.create({
      enrollmentId: enrollment.id,
      studentId: student.id,
      liveClassId: c.id,
      status: 'ATTENDED',
      joinedAt: c.startTime,
    });
  }

  console.log(`✅ Student enrolled in Web Development (2 classes attended, 10 remaining).`);

  // ==========================================
  // 7. SEED TESTIMONIALS & FAQS FOR HOMEPAGE
  // ==========================================
  console.log('\n💬 Seeding Testimonials, FAQs, and Blog Posts...');

  await Testimonial.bulkCreate([
    {
      name: 'Rohan Mehta',
      role: 'Full Stack Developer @ Zomato',
      content: 'The 12-class live bootcamp format was incredible. The tutor walked us through real code every week, and the direct Google Meet link made joining seamless!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Pooja Verma',
      role: 'Video Editor & Content Creator',
      content: 'Learning Premiere Pro and After Effects with Neha Ma\'am gave me the skills to land freelance editing contracts within weeks of course completion.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    },
  ]);

  await Faq.bulkCreate([
    {
      question: 'How do the live classes work?',
      answer: 'Each package includes 12 live classes scheduled on assigned days (e.g., twice a week). You can join the live interactive sessions directly using the Google Meet link in your student dashboard.',
      order: 1,
    },
    {
      question: 'What happens if I miss a scheduled class?',
      answer: 'If you miss a class, it is marked as absent and deducted from your 12-class limit. After the tutor completes all 12 classes, your package expires.',
      order: 2,
    },
    {
      question: 'Can tutors teach multiple packages?',
      answer: 'Yes! Our certified instructors can be assigned to teach multiple batches (e.g. Web Development and Video Editing) with dedicated schedules.',
      order: 3,
    },
  ]);

  await BlogPost.create({
    authorId: admin.id,
    title: 'How to Master Modern Web Development in 12 Weeks',
    slug: 'how-to-master-web-development-12-weeks',
    category: 'Web Development',
    excerpt: 'A comprehensive roadmap for beginners transitioning into high-paying web engineering roles.',
    content: '<p>Learning modern web development requires consistency, hands-on practice, and mentor feedback...</p>',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    status: 'PUBLISHED',
  });

  console.log('✅ Testimonials, FAQs, and Blog post seeded.');

  console.log('\n🎉 ==============================================');
  console.log('✨ DATABASE REFRESH & SEEDING COMPLETED!');
  console.log('==============================================');
  console.log('🔑 Credentials to Log In:');
  console.log('   👨‍💼 Admin:   admin@company.com          / admin123');
  console.log('   🧑‍🏫 Tutor 1: tutor.web@flymedia.com     / tutor123 (Web Dev & MERN)');
  console.log('   🧑‍🏫 Tutor 2: tutor.video@flymedia.com   / tutor123 (Video Editing & Design)');
  console.log('   👨‍🎓 Student: student@example.com        / student123 (Enrolled in Web Dev)');
  console.log('==============================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error resetting database:', err);
  process.exit(1);
});
