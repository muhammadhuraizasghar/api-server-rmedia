import { spawn } from 'child_process';

export interface YtDlpInfo {
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  formats: {
    url: string;
    ext: string;
    vcodec: string;
    acodec: string;
    format_id: string;
    resolution?: string;
    filesize?: number;
  }[];
}

export async function getYtDlpInfo(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', [
      '--dump-json',
      '--no-playlist',
      '--flat-playlist',
      url
    ]);

    let stdout = '';
    let stderr = '';

    ytDlp.stdout.on('data', (data) => {
      stdout += data;
    });

    ytDlp.stderr.on('data', (data) => {
      stderr += data;
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error('Failed to parse yt-dlp output'));
      }
    });
  });
}
