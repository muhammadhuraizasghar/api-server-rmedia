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
    // If it's already a direct cobalt/cdn link, proxy it directly
    // If it's still a social link, we handle it as a backup
    let downloadUrl = url;
    const isSocial = /youtube\.com|youtu\.be|instagram\.com|tiktok\.com|linkedin\.com|snapchat\.com|twitter\.com|x\.com/.test(url);
    
    if (isSocial && !url.includes('cobalt')) {
      // Backup extraction if Convert route missed it
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
      } catch (e) {}
    }

    const response = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      },
      maxRedirects: 5,
      timeout: 120000, // 2 mins for large files
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentLength = response.headers['content-length'];

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    // Ensure filename has correct extension if missing
    let finalFilename = filename;
    if (!finalFilename.includes('.')) {
      const ext = contentType.split('/')[1]?.split(';')[0] || 'bin';
      finalFilename += `.${ext}`;
    }
    
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFilename)}"`);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Direct piping for speed and no corruption
    const stream = new ReadableStream({
      async start(controller) {
        response.data.on('data', (chunk: any) => controller.enqueue(chunk));
        response.data.on('end', () => controller.close());
        response.data.on('error', (err: any) => controller.error(err));
      },
    });

    return new Response(stream, { headers });
  } catch (error: any) {
    console.error('Proxy download failed:', error.message);
    return NextResponse.json({ error: 'Failed to proxy download' }, { status: 500 });
  }
}
