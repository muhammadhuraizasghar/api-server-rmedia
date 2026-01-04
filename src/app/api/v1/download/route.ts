import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { spawn } from 'child_process';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // If it's a social link, we handle it as a backup
    let downloadUrl = url;
    const isSocial = /youtube\.com|youtu\.be|instagram\.com|tiktok\.com|linkedin\.com|snapchat\.com|twitter\.com|x\.com/.test(url);
    const targetFormat = filename.split('.').pop()?.toLowerCase();
    
    if (isSocial && !url.includes('cobalt')) {
      // Backup extraction if Convert route missed it
      try {
        const isAudio = ['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'opus'].includes(targetFormat || '');
        const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', {
          url: url,
          videoQuality: '1080',
          isAudioOnly: isAudio,
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
      timeout: 120000, 
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentLength = response.headers['content-length'];

    // Professional Conversion logic using ffmpeg if needed
    // We only convert if target format is different from source and it's a common media conversion
    const needsConversion = targetFormat && !contentType.includes(targetFormat) && 
                           ['mp3', 'wav', 'ogg', 'aac'].includes(targetFormat);

    const headers = new Headers();
    headers.set('Content-Type', needsConversion ? `audio/${targetFormat}` : contentType);
    let finalFilename = filename;
    if (!finalFilename.includes('.')) {
      finalFilename += `.${targetFormat || 'bin'}`;
    }
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFilename)}"`);

    if (needsConversion) {
      // Stream through ffmpeg for real-time conversion
      const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-f', targetFormat!,
        '-acodec', targetFormat === 'mp3' ? 'libmp3lame' : (targetFormat === 'wav' ? 'pcm_s16le' : 'copy'),
        '-ab', '192k',
        'pipe:1'
      ]);

      const stream = new ReadableStream({
        start(controller) {
          response.data.pipe(ffmpeg.stdin);
          ffmpeg.stdout.on('data', (chunk) => controller.enqueue(chunk));
          ffmpeg.stdout.on('end', () => controller.close());
          ffmpeg.on('error', (err) => controller.error(err));
          ffmpeg.stderr.on('data', (data) => console.log(`ffmpeg: ${data}`));
        }
      });
      return new Response(stream, { headers });
    }

    // Direct piping for speed and no corruption if no conversion needed
    const stream = new ReadableStream({
      async start(controller) {
        response.data.on('data', (chunk: any) => controller.enqueue(chunk));
        response.data.on('end', () => controller.close());
        response.data.on('error', (err: any) => controller.error(err));
      },
    });

    if (contentLength && !needsConversion) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(stream, { headers });
  } catch (error: any) {
    console.error('Proxy download failed:', error.message);
    return NextResponse.json({ error: 'Failed to proxy download' }, { status: 500 });
  }
}
