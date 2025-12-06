import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Vercel 会自动注入这些地理位置信息
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('x-user-country') || 
                  'US';
  
  // 从请求头获取 IP 地址 (Vercel 自动注入)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0].trim() || realIp || '未知';
  
  const city = request.headers.get('x-vercel-ip-city') || '';
  const region = request.headers.get('x-vercel-ip-country-region') || '';
  
  return NextResponse.json({ 
    country,
    ip,
    city,
    region
  });
}