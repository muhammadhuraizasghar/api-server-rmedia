import { NextRequest, NextResponse } from 'next/server';
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
    const results = await service.extract(url, format);

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
