import { Enrollment, LiveClass, ClassAttendance } from '../db/models';

export interface EnrollmentProgress {
  totalClasses: number;
  conductedClasses: number;
  attendedClasses: number;
  missedClasses: number;
  remainingClasses: number;
  isExpired: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
  progressPercentage: number;
}

/**
 * Computes the real-time attendance and expiry progress for a student enrollment.
 * 
 * Rules:
 * - A package contains `totalClasses` (default 12).
 * - A class is considered conducted once its scheduled time + duration has passed.
 * - If a student attended (clicked the Meet link), it is counted as attended.
 * - If the student did NOT attend a conducted class, it is counted as missed/absent (they lose the class).
 * - When conductedClasses >= totalClasses, the package is EXPIRED.
 */
export async function syncAndGetEnrollmentProgress(enrollmentId: string): Promise<EnrollmentProgress | null> {
  const enrollment = await Enrollment.findByPk(enrollmentId, {
    include: [
      {
        model: ClassAttendance,
        as: 'attendances',
      },
    ],
  });

  if (!enrollment) return null;

  const totalClasses = enrollment.totalClasses || 12;

  // Find all scheduled live classes for this package
  const classes = await LiveClass.findAll({
    where: {
      packageId: enrollment.packageId,
    },
    order: [['startTime', 'ASC']],
  });

  const now = Date.now();
  let conducted = 0;
  const attendedSet = new Set(
    (enrollment.attendances || [])
      .filter((a) => a.status === 'ATTENDED')
      .map((a) => a.liveClassId)
  );

  let attended = 0;

  for (const c of classes) {
    if (c.status === 'CANCELLED') continue;
    const classEndTime = new Date(c.startTime).getTime() + (c.duration || 60) * 60000;
    
    // Check if class has elapsed
    if (classEndTime <= now) {
      conducted++;
      if (attendedSet.has(c.id)) {
        attended++;
      }
    }
  }

  const missed = Math.max(0, conducted - attended);
  const remaining = Math.max(0, totalClasses - conducted);
  const isExpired = conducted >= totalClasses;
  const newStatus: 'ACTIVE' | 'EXPIRED' | 'COMPLETED' = isExpired ? 'EXPIRED' : enrollment.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE';

  // Persist status updates to database if changed
  if (
    enrollment.conductedClasses !== conducted ||
    enrollment.attendedClasses !== attended ||
    enrollment.status !== newStatus
  ) {
    enrollment.conductedClasses = conducted;
    enrollment.attendedClasses = attended;
    enrollment.status = newStatus;
    if (isExpired && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
  }

  const progressPercentage = Math.min(100, Math.round((conducted / totalClasses) * 100));

  return {
    totalClasses,
    conductedClasses: conducted,
    attendedClasses: attended,
    missedClasses: missed,
    remainingClasses: remaining,
    isExpired,
    status: newStatus,
    progressPercentage,
  };
}

/**
 * Records student attendance when joining Google Meet link
 */
export async function recordStudentClassJoin(userId: string, liveClassId: string): Promise<{ success: boolean; meetLink?: string; error?: string }> {
  const liveClass = await LiveClass.findByPk(liveClassId);
  if (!liveClass) {
    return { success: false, error: 'Live class session not found' };
  }

  if (!liveClass.meetLink) {
    return { success: false, error: 'Meet link has not been provided yet' };
  }

  // Find enrollment for this student and package if class is tied to a package
  let enrollment = null;
  if (liveClass.packageId) {
    enrollment = await Enrollment.findOne({
      where: {
        userId,
        packageId: liveClass.packageId,
      },
    });
  }

  if (enrollment) {
    // Record or update attendance
    const [attendance, created] = await ClassAttendance.findOrCreate({
      where: {
        enrollmentId: enrollment.id,
        liveClassId,
      },
      defaults: {
        enrollmentId: enrollment.id,
        studentId: userId,
        liveClassId,
        status: 'ATTENDED',
        joinedAt: new Date(),
      },
    });

    if (!created && attendance.status !== 'ATTENDED') {
      attendance.status = 'ATTENDED';
      attendance.joinedAt = new Date();
      await attendance.save();
    }

    // Refresh enrollment progress
    await syncAndGetEnrollmentProgress(enrollment.id);
  }

  return { success: true, meetLink: liveClass.meetLink };
}
