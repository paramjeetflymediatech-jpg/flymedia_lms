import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathArray } = await params;
    
    // Prevent directory traversal attacks
    if (pathArray.some(p => p.includes('..'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathArray);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const stat = await fs.promises.stat(filePath);
    const etag = `W/"${stat.size.toString(16)}-${stat.mtime.getTime().toString(16)}"`;
    
    // Check conditional request for 304 Not Modified
    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.m4v') contentType = 'video/mp4';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'Last-Modified': stat.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error('Uploads API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
