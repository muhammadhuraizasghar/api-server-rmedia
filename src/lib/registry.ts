export const SUPPORTED_FORMATS = [
  // Audio Formats
  'mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'amr', 'mpa', 'alac', 'mka', 'ape', 'pcm',
  // Video Formats
  'mp4', 'mp4-1080', 'mp4-2k', 'mp4-4k', 'webm', 'mkv', 'mov', 'avi', 'flv', 'wmv', '3gp', 'mpeg', 'm4v', 'f4v', 'vob', 'ogv', 'ts', 'm2ts',
  // Image Formats
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'ico', 'heic', 'psd', 'ai', 'eps', 'raw', 'cr2', 'nef', 'orf', 'sr2',
  // Document Formats
  'pdf', 'txt', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'csv', 'json', 'xml', 'epub', 'rtf', 'odt', 'ods', 'odp',
  // Archives & Compressed
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg',
  // Code & Web
  'html', 'css', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'sql', 'yaml', 'md',
  // Professional & Other
  'mxf', 'dpx', 'exr', 'tga', 'dds', 'pnm', 'jp2', 'j2k', 'jpf', 'jpm', 'jpg2', 'j2c', 'jpc', 'jxr', 'hdp', 'wdp'
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
