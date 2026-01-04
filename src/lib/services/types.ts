export interface MediaResult {
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  format: string;
  thumbnail?: string;
  title?: string;
}

export interface PlatformService {
  extract(url: string, format?: string): Promise<MediaResult[]>;
}
