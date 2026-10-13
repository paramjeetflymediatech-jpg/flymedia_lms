import { NextResponse } from 'next/server';
import { generateLlmsTxt } from '../../src/lib/llms';

export const dynamic = 'force-dynamic';

/**
 * Dynamic route handler for /llms.txt adhering to the https://llmstxt.org standard.
 * Provides a clean, real-time structured Markdown summary for LLMs and AI crawlers.
 */
export async function GET() {
  try {
    const markdown = await generateLlmsTxt();

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate /llms.txt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
