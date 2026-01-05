import { PlatformService, MediaResult } from './types';
import { getYtDlpInfo } from './ytdlp-util';

export class YoutubeService implements PlatformService {
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
        title: info.title,
        quality: isAudio ? '320kbps' : (bestFormat?.resolution || '720p'),
        thumbnail: info.thumbnail,
      });

      return results;
    } catch (error) {
      console.error('YouTube extraction failed:', error);
      // Fallback to basic extraction if yt-dlp fails
      return this.fallbackExtract(url, format);
    }
  }

  private async fallbackExtract(url: string, format?: string): Promise<MediaResult[]> {
    // Basic fallback logic
    const results: MediaResult[] = [];
    const isAudio = ['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'opus'].includes(format || '');
    results.push({
      url: url,
      type: isAudio ? 'audio' : 'video',
      format: format || 'mp4',
      title: 'YouTube Media',
      quality: '720p',
    });
    return results;
  }
}
