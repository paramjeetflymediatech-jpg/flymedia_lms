import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/src/lib/auth';
import { Package, User, Enrollment, Certificate } from '@/src/db/models';
import { generateCertificatePDF } from '@/src/lib/pdf';

export async function GET(request: NextRequest) {
  const session = await getSessionPayload();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get('packageId') || searchParams.get('courseId'); // allow both for legacy

  if (!packageId) {
    return new NextResponse('Package ID is required', { status: 400 });
  }

  try {
    const pkg = await Package.findByPk(packageId);

    if (!pkg) {
      return new NextResponse('Package not found', { status: 404 });
    }

    const enrollment = await Enrollment.findOne({
      where: { userId: session.userId, packageId }
    });

    if (!enrollment) {
      return new NextResponse('You are not enrolled in this package', { status: 403 });
    }

    // 4. Find or Create certificate record
    let certificate = await Certificate.findOne({
      where: { userId: session.userId, packageId }
    });

    const certificateId = certificate ? certificate.id : crypto.randomUUID();
    const issuedAt = certificate ? certificate.issuedAt : new Date();

    if (!certificate) {
      // Create db record
      certificate = await Certificate.create({
        id: certificateId,
        userId: session.userId,
        packageId,
        url: `/api/certificate/download?packageId=${packageId}`, // Self URL
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
      pkg.title,
      certificateId,
      formattedDate
    );

    // 6. Return binary stream
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${pkg.slug}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Certificate generation API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
