import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/src/lib/auth';
import { Course, User, Enrollment, Lesson, Progress, Module, Certificate } from '@/src/db/models';
import { generateCertificatePDF } from '@/src/lib/pdf';

export async function GET(request: NextRequest) {
  const session = await getSessionPayload();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return new NextResponse('Course ID is required', { status: 400 });
  }

  try {
    // 1. Fetch the course, including lessons to compute completion progress
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Module,
        as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }]
      }]
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    // Get all lessons for this course
    const allLessons: any[] = [];
    if (course.modules) {
      for (const mod of course.modules) {
        if ((mod as any).lessons) {
          allLessons.push(...(mod as any).lessons);
        }
      }
    }

    if (allLessons.length === 0) {
      return new NextResponse('Course has no content yet', { status: 400 });
    }

    // 2. Fetch the completed progress records for the user
    const completedProgress = await Progress.findAll({
      where: {
        userId: session.userId,
        lessonId: allLessons.map(l => l.id),
        completed: true
      }
    });

    const completionRate = (completedProgress.length / allLessons.length) * 100;
    
    // Check if progress is 100% (allowing a tiny margin for float precision)
    if (completionRate < 99.9) {
      return new NextResponse(`Course progress is only ${Math.round(completionRate)}%. You must complete all lessons to download the certificate.`, { status: 400 });
    }

    // 3. Mark enrollment as completed if not done
    const enrollment = await Enrollment.findOne({
      where: { userId: session.userId, courseId }
    });
    if (enrollment && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      await enrollment.save();
    }

    // 4. Find or Create certificate record
    let certificate = await Certificate.findOne({
      where: { userId: session.userId, courseId }
    });

    const certificateId = certificate ? certificate.id : crypto.randomUUID();
    const issuedAt = certificate ? certificate.issuedAt : new Date();

    if (!certificate) {
      // Create db record
      certificate = await Certificate.create({
        id: certificateId,
        userId: session.userId,
        courseId,
        url: `/api/certificate/download?courseId=${courseId}`, // Self URL
        issuedAt
      });
    }

    // 5. Generate PDF
    const formattedDate = issuedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const pdfBuffer = await generateCertificatePDF(
      session.name || 'Student',
      course.title,
      certificateId,
      formattedDate
    );

    // 6. Return binary stream
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${course.slug}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Certificate generation API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
