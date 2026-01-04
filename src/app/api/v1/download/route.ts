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
    let downloadUrl = url;

    // If it's a social media link (YouTube, Instagram, etc.), use Cobalt for "Perfect Media"
    const isSocial = /youtube\.com|youtu\.be|instagram\.com|tiktok\.com|linkedin\.com|snapchat\.com/.test(url);
    
    if (isSocial) {
      try {
        const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', {
          url: url,
          videoQuality: '1080',
          filenamePattern: 'basic'
        }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (cobaltResponse.data && cobaltResponse.data.url) {
          downloadUrl = cobaltResponse.data.url;
        }
      } catch (cobaltErr) {
        console.error('Cobalt extraction failed, falling back to direct proxy:', cobaltErr);
      }
    }

    const response = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 60000, // 60 seconds timeout for larger media
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
