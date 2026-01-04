import axios from 'axios';
import { PlatformService, MediaResult } from './types';

export class YoutubeService implements PlatformService {
  async extract(url: string, format?: string): Promise<MediaResult[]> {
    try {
      // YouTube extraction usually requires an API key or a downloader library.
      // This is a simulation using oEmbed for basic metadata.
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const { data } = await axios.get(oembedUrl);

      const results: MediaResult[] = [];
      const videoId = this.extractVideoId(url);

      // Main Video link (Simulated direct download via our proxy)
      results.push({
        url: `https://rr5---sn-n4v7kn7z.googlevideo.com/videoplayback?id=${videoId}&title=${encodeURIComponent(data.title)}`, // Simulated direct video URL
        type: 'video',
        format: format || 'mp4',
        title: data.title,
        thumbnail: data.thumbnail_url,
      });

      // Audio format request
      if (['mp3', 'ogg', 'flac'].includes(format || '')) {
        results.push({
          url: `https://rr5---sn-n4v7kn7z.googlevideo.com/videoplayback?id=${videoId}&audio=1&title=${encodeURIComponent(data.title)}`, // Simulated direct audio URL
          type: 'audio',
          format: format!,
          title: `${data.title} (Audio)`,
        });
      }

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
