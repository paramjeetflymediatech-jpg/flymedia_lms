import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/lib/auth';
import { recordStudentClassJoin } from '@/src/lib/attendance';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  const baseUrl = req.nextUrl.origin;

  if (!user) {
    const redirectUrl = new URL(`/login?redirect=/api/classes/${id}/join`, baseUrl);
    return NextResponse.redirect(redirectUrl);
  }

  const result = await recordStudentClassJoin(user.id, id);

  if (!result.success || !result.meetLink) {
    // Return error or redirect back to dashboard with alert
    const dashboardUrl = new URL('/dashboard?error=' + encodeURIComponent(result.error || 'Could not join class'), baseUrl);
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect student to Google Meet link!
  return NextResponse.redirect(result.meetLink);
}
