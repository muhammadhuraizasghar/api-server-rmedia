export const API_CONFIG = {
  // Supports comma separated keys from ENV
  keys: (process.env.API_KEYS || 'default-secret-key,test-key-1,user-key-100').split(','),
  allowedOrigins: ['*'],
  supportedPlatforms: [
    'linkedin',
    'instagram',
    'youtube',
    'snapchat',
    'tiktok',
  ],
  maxRequestsPerMinute: 60,
};
