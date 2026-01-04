import axios from 'axios';
import { PlatformService, MediaResult } from './types';

export class YoutubeService implements PlatformService {
  async extract(url: string, format?: string): Promise<MediaResult[]> {
    try {
      // Using a more reliable extraction method (simulating a real backend extraction)
      // In a production app, you would use cobalt or a private extraction server
      const videoId = this.extractVideoId(url);
      
      // We'll use a public oEmbed for metadata and a direct download proxy
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const { data: meta } = await axios.get(oembedUrl);

      const results: MediaResult[] = [];

      // Determine if it's audio or video based on format
      const isAudio = ['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'opus'].includes(format || '');
      
      // We return the extraction request that our server-side download route will handle
      results.push({
        url: url, // Pass the original URL to the downloader proxy
        type: isAudio ? 'audio' : 'video',
        format: format || 'mp4',
        title: meta.title,
        quality: format?.includes('1080') ? '1080p' : '720p',
        thumbnail: meta.thumbnail_url,
      });

      return results;
    } catch (error) {
      console.error('YouTube extraction failed:', error);
      throw new Error('Failed to extract media from YouTube');
    }
  }

  private extractVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'unknown';
  }
}
