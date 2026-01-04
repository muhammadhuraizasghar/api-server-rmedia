import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_CONFIG } from './lib/config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (pathname.startsWith('/api')) {
    const apiKey = request.headers.get('x-api-key');
    const origin = request.headers.get('origin') || request.headers.get('referer');
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    console.log(`[API Request] Path: ${pathname}, IP: ${ip}, Origin: ${origin}`);

    // Validate API Key
    if (!apiKey || !API_CONFIG.keys.includes(apiKey)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API Key' },
        { status: 401 }
      );
    }

    // Optional: Validate Origin/Referer if needed
    // if (origin && !API_CONFIG.allowedOrigins.includes('*') && !API_CONFIG.allowedOrigins.some(o => origin.includes(o))) {
    //   return NextResponse.json({ error: 'Forbidden: Invalid Origin' }, { status: 403 });
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
