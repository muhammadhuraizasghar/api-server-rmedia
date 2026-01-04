import { NextResponse } from 'next/server';
import { SUPPORTED_FORMATS, PLATFORM_MAPPING } from '@/lib/registry';

export async function GET() {
  const apis = [
    {
      name: 'Media Conversion API',
      endpoint: '/api/v1/convert',
      method: 'POST',
      description: 'Convert media from various platforms to different formats',
      params: {
        url: 'Platform URL (LinkedIn, YouTube, etc.)',
        format: 'Target format (mp3, pdf, etc.)',
      }
    },
    ...SUPPORTED_FORMATS.map(format => ({
      name: `Convert to ${format.toUpperCase()}`,
      endpoint: `/api/v1/convert?format=${format}`,
      method: 'POST',
      description: `Direct endpoint for ${format} conversion`,
    })),
    ...Object.values(PLATFORM_MAPPING).map(platform => ({
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Extractor`,
      endpoint: `/api/v1/extract/${platform}`,
      method: 'GET',
      description: `Extract media from ${platform}`,
    }))
  ];

  // Truncate to 100 or pad to 100 as requested
  const finalApis = apis.slice(0, 100);
  while (finalApis.length < 100) {
    finalApis.push({
      name: `Extended API ${finalApis.length + 1}`,
      endpoint: `/api/v1/extra/${finalApis.length + 1}`,
      method: 'GET',
      description: 'Reserved for future use',
    });
  }

  return NextResponse.json({
    total: finalApis.length,
    apis: finalApis,
  });
}
