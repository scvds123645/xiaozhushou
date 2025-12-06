import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Vercel 会自动注入这些地理位置和 IP 信息
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('x-user-country') || 
                  'US';
  
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             request.ip ||
             '0.0.0.0';
  
  const city = request.headers.get('x-vercel-ip-city') || '';
  const region = request.headers.get('x-vercel-ip-country-region') || '';
  
  return NextResponse.json({ 
    country,
    ip,
    city,
    region
  });
}