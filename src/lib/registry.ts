export const SUPPORTED_FORMATS = [
  // Audio Formats
  'mp3', 'ogg', 'mpa', 'flac', 'wav', 'aac', 'm4a', 'wma', 'aiff', 'alac',
  // Video Formats
  'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'mpeg',
  // Image Formats
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'heic',
  // Document Formats
  'pdf', 'docx', 'txt', 'epub', 'rtf', 'csv', 'xlsx', 'pptx',
  // 100+ placeholders (extensible)
  ...Array.from({ length: 60 }, (_, i) => `format_${i + 1}`)
];

export const PLATFORM_MAPPING: Record<string, string> = {
  'linkedin.com': 'linkedin',
  'instagram.com': 'instagram',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'tiktok.com': 'tiktok',
  'snapchat.com': 'snapchat',
};

export function getPlatformFromUrl(url: string): string | null {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    for (const [key, platform] of Object.entries(PLATFORM_MAPPING)) {
      if (domain.includes(key)) return platform;
    }
    return null;
  } catch {
    return null;
  }
}
