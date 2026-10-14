import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Permanently redirect /llms-full.txt to /llms.txt.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/llms.txt';
  return NextResponse.redirect(url, 301);
}
