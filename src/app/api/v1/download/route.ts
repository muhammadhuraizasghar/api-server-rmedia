import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': new URL(url).origin,
      },
      timeout: 30000, // 30 seconds timeout
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentLength = response.headers['content-length'];

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Convert axios stream to a web stream that Next.js can return
    const stream = new ReadableStream({
      async start(controller) {
        response.data.on('data', (chunk: any) => {
          controller.enqueue(chunk);
        });
        response.data.on('end', () => {
          controller.close();
        });
        response.data.on('error', (err: any) => {
          controller.error(err);
        });
      },
    });

    return new Response(stream, { headers });
  } catch (error: any) {
    console.error('Proxy download failed:', error.message);
    return NextResponse.json({ error: 'Failed to proxy download' }, { status: 500 });
  }
}
