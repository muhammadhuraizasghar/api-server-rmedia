import { PlatformService, MediaResult } from './types';
import { getYtDlpInfo } from './ytdlp-util';

export class SocialMediaService implements PlatformService {
  async extract(url: string, format?: string): Promise<MediaResult[]> {
    try {
      const info = await getYtDlpInfo(url);
      const results: MediaResult[] = [];
      
      const isAudio = ['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'opus'].includes(format || '');
      
      // Find the best format
      let bestFormat = info.formats.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none').pop();
      if (isAudio) {
        bestFormat = info.formats.filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none').pop();
      }

      results.push({
        url: bestFormat?.url || url,
        type: isAudio ? 'audio' : 'video',
        format: format || (isAudio ? 'mp3' : 'mp4'),
        title: info.title || 'Social Media',
        thumbnail: info.thumbnail,
        quality: isAudio ? '320kbps' : (bestFormat?.resolution || '1080p'),
      });

      return results;
    } catch (error) {
      console.error('Social media extraction failed:', error);
      return [{
        url: url,
        type: 'video',
        format: format || 'mp4',
        title: 'Social Media',
      }];
    }
  }
}
