import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../src/lib/auth';
import { Course, Enrollment } from '../../../../src/db/models';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, batchMode } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.price && Number(course.price) > 0) {
      return NextResponse.json({ error: 'This course is not free' }, { status: 400 });
    }

    const existing = await Enrollment.findOne({
      where: { userId: user.id, courseId: course.id }
    });

    if (!existing) {
      await Enrollment.create({
        userId: user.id,
        courseId: course.id,
        batchMode: batchMode || 'ONLINE',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Free enrollment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
