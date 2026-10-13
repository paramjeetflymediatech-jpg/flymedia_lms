import { NextResponse } from 'next/server';
import { generateLlmsFullTxt } from '../../src/lib/llms';

export const dynamic = 'force-dynamic';

/**
 * Dynamic route handler for /llms-full.txt.
 * Provides complete course modules, curriculum breakdown, and details for AI context ingestion.
 */
export async function GET() {
  try {
    const markdown = await generateLlmsFullTxt();

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate /llms-full.txt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
