import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformService, MediaResult } from './types';

export class LinkedInService implements PlatformService {
  async extract(url: string, format?: string): Promise<MediaResult[]> {
    try {
      // In a real scenario, you might need a headless browser or a specialized API
      // This is a simplified example using cheerio for meta tags
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);
      const results: MediaResult[] = [];

      // Extract OG Image
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        results.push({
          url: ogImage,
          type: 'image',
          format: 'jpg',
          title: $('title').text() || 'LinkedIn Image',
        });
      }

      // Extract OG Video (if available)
      const ogVideo = $('meta[property="og:video"]').attr('content');
      if (ogVideo) {
        results.push({
          url: ogVideo,
          type: 'video',
          format: format || 'mp4',
          title: $('title').text() || 'LinkedIn Video',
        });
      }

      // Handle PDF format request (Simulated conversion)
      if (format === 'pdf') {
        results.push({
          url: `${url}?format=pdf`, // In reality, use a library like puppeteer to print to PDF
          type: 'document',
          format: 'pdf',
          title: $('title').text() + ' - PDF',
        });
      }

      return results;
    } catch (error) {
      console.error('LinkedIn extraction failed:', error);
      throw new Error('Failed to extract media from LinkedIn');
    }
  }
}
