import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getPlatformFromUrl, SUPPORTED_FORMATS } from '@/lib/registry';
import { LinkedInService } from '@/lib/services/linkedin';
import { YoutubeService } from '@/lib/services/youtube';
import { InstagramService } from '@/lib/services/instagram';

const services = {
  linkedin: new LinkedInService(),
  youtube: new YoutubeService(),
  instagram: new InstagramService(),
  tiktok: new InstagramService(), // Placeholder
  snapchat: new InstagramService(), // Placeholder
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, format } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (format && !SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json({ error: `Format ${format} is not supported` }, { status: 400 });
    }

    const platform = getPlatformFromUrl(url);
    if (!platform || !services[platform as keyof typeof services]) {
      return NextResponse.json({ 
        error: 'Unsupported platform or service not implemented yet',
        platform: platform || 'unknown'
      }, { status: 400 });
    }

    const service = services[platform as keyof typeof services];
    let results = await service.extract(url, format);

    // Super-power: Actual extraction for social media
    const isSocial = /youtube\.com|youtu\.be|instagram\.com|tiktok\.com|linkedin\.com|snapchat\.com|twitter\.com|x\.com/.test(url);
    if (isSocial) {
      try {
        const isAudio = ['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'opus'].includes(format || '');
        const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', {
          url: url,
          videoQuality: '1080',
          audioFormat: isAudio ? (format === 'mp3' ? 'mp3' : 'best') : 'best',
          isAudioOnly: isAudio,
          filenamePattern: 'basic',
          twitterGif: true,
          youtubeVideoCodec: 'h264' // Better compatibility for ffmpeg processing
        }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
          }
        });

        if (cobaltResponse.data && cobaltResponse.data.url) {
          results = [{
            url: cobaltResponse.data.url,
            type: isAudio ? 'audio' : 'video',
            format: format || (isAudio ? 'mp3' : 'mp4'),
            title: results[0]?.title || 'Extracted Media',
            quality: isAudio ? '320kbps' : '1080p Full HD',
            thumbnail: results[0]?.thumbnail
          }];
        }
      } catch (cobaltErr: any) {
        console.error('Cobalt extraction during convert failed:', cobaltErr.message);
        // Fallback to initial results if cobalt fails
      }
    }

    return NextResponse.json({
      success: true,
      platform,
      format: format || 'original',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}

// Support GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Media API is running',
    supported_platforms: Object.keys(services),
    total_formats_supported: SUPPORTED_FORMATS.length,
  });
}
