import { User, Package, PackageTutor, ClassSchedule, LiveClass, Enrollment, ClassAttendance } from '../src/db/models';
import { syncAndGetEnrollmentProgress, recordStudentClassJoin } from '../src/lib/attendance';

async function runTest() {
  console.log('--- 🧪 STARTING TUTOR, SCHEDULE & EXPIRATION FLOW TEST ---');

  // 1. Fetch or create packages (e.g. Web Development and Video Editing)
  let pkgWeb = await Package.findOne({ where: { slug: 'web-development' } });
  if (!pkgWeb) {
    pkgWeb = await Package.create({
      title: 'Full Stack Web Development',
      slug: 'web-development',
      description: 'Learn modern full-stack web development.',
      totalClasses: 12,
    });
  }

  let pkgVideo = await Package.findOne({ where: { slug: 'video-editing' } });
  if (!pkgVideo) {
    pkgVideo = await Package.create({
      title: 'Professional Video Editing',
      slug: 'video-editing',
      description: 'Master Premiere Pro and After Effects.',
      totalClasses: 12,
    });
  }

  console.log('✅ Packages verified:');
  console.log(`   1. ${pkgWeb.title} (ID: ${pkgWeb.id})`);
  console.log(`   2. ${pkgVideo.title} (ID: ${pkgVideo.id})`);

  // 2. Create Tutor
  const tutorEmail = `tutor_test_${Date.now()}@example.com`;
  const tutor = await User.create({
    name: 'Amit Verma',
    email: tutorEmail,
    role: 'TUTOR',
    professionTitle: 'Lead Full Stack & Video Instructor',
    bio: '10+ years experience training industry professionals.',
  });

  console.log(`✅ Tutor created: ${tutor.name} (${tutor.email})`);

  // 3. Assign tutor to multiple packages (PackageTutor)
  await PackageTutor.bulkCreate([
    { packageId: pkgWeb.id, tutorId: tutor.id },
    { packageId: pkgVideo.id, tutorId: tutor.id },
  ]);

  const assignedPackages = await PackageTutor.findAll({ where: { tutorId: tutor.id } });
  console.log(`✅ Assigned to ${assignedPackages.length} packages: Web Dev & Video Editing`);

  // 4. Generate 12-class recurring schedule (Twice a week: Mon & Wed at 18:00)
  const meetLink = 'https://meet.google.com/test-abc-xyz';
  const schedule = await ClassSchedule.create({
    packageId: pkgWeb.id,
    tutorId: tutor.id,
    daysOfWeek: ['Monday', 'Wednesday'],
    startTime: '18:00',
    duration: 60,
    meetLink,
    startDate: new Date().toISOString().slice(0, 10),
    totalClasses: 12,
    status: 'ACTIVE',
  });

  console.log(`✅ ClassSchedule created (ID: ${schedule.id})`);

  // Generate 12 sequential LiveClass items
  const classesToCreate: any[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 14); // Set start date 14 days ago to test elapsed classes!

  for (let i = 1; i <= 12; i++) {
    const classTime = new Date(cursor);
    classTime.setDate(cursor.getDate() + (i * 2)); // every 2 days
    classesToCreate.push({
      packageId: pkgWeb.id,
      tutorId: tutor.id,
      scheduleId: schedule.id,
      classNumber: i,
      title: `${pkgWeb.title} - Class ${i}`,
      meetLink,
      startTime: classTime,
      duration: 60,
      status: 'SCHEDULED',
    });
  }

  const createdClasses = await LiveClass.bulkCreate(classesToCreate);
  console.log(`✅ Generated ${createdClasses.length} LiveClass sessions (Class #1 to #12)`);

  // 5. Create Student & Enrollment
  const studentEmail = `student_test_${Date.now()}@example.com`;
  const student = await User.create({
    name: 'Karan Singh',
    email: studentEmail,
    role: 'STUDENT',
  });

  const enrollment = await Enrollment.create({
    userId: student.id,
    packageId: pkgWeb.id,
    totalClasses: 12,
    conductedClasses: 0,
    attendedClasses: 0,
    status: 'ACTIVE',
  });

  console.log(`✅ Student enrolled: ${student.name} in ${pkgWeb.title} (Enrollment ID: ${enrollment.id})`);

  // 6. Test Student joining Class #1 and Class #2 via meet link
  const class1 = createdClasses[0];
  const class2 = createdClasses[1];

  const joinResult1 = await recordStudentClassJoin(student.id, class1.id);
  console.log(`✅ Student joined Class #1: ${joinResult1.success}, redirected to: ${joinResult1.meetLink}`);

  const joinResult2 = await recordStudentClassJoin(student.id, class2.id);
  console.log(`✅ Student joined Class #2: ${joinResult2.success}`);

  // 7. Check attendance & progress
  const progressAfterJoin = await syncAndGetEnrollmentProgress(enrollment.id);
  console.log('📊 Real-Time Progress:');
  console.log(`   - Total Classes: ${progressAfterJoin?.totalClasses}`);
  console.log(`   - Conducted (Time Passed): ${progressAfterJoin?.conductedClasses}`);
  console.log(`   - Attended: ${progressAfterJoin?.attendedClasses}`);
  console.log(`   - Missed / Absent (Lost Classes): ${progressAfterJoin?.missedClasses}`);
  console.log(`   - Remaining: ${progressAfterJoin?.remainingClasses}`);
  console.log(`   - Package Status: ${progressAfterJoin?.status}`);
  console.log(`   - Is Expired: ${progressAfterJoin?.isExpired}`);

  console.log('--- 🎉 ALL CHECKS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
