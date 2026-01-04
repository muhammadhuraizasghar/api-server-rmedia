import { NextResponse } from 'next/server';
import { API_MANIFEST } from '@/lib/manifest';

export async function GET() {
  return NextResponse.json({
    success: true,
    total_apis: API_MANIFEST.length,
    apis: API_MANIFEST,
  });
}
