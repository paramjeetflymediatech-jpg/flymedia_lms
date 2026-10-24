import { NextRequest, NextResponse } from 'next/server';
import { AppStoreLinks } from '../../src/constants/appLinks';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // Detect iOS (iPhone, iPad, iPod)
  const isIOS =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent));

  // Detect Android
  const isAndroid = /Android/i.test(userAgent);

  if (isIOS) {
    return NextResponse.redirect(AppStoreLinks.appStore, 307);
  }

  if (isAndroid) {
    return NextResponse.redirect(AppStoreLinks.playStore, 307);
  }

  // Fallback for desktop visitors: take them to the /download landing page
  const downloadUrl = new URL('/download', request.url);
  return NextResponse.redirect(downloadUrl, 307);
}
