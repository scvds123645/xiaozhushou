import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             '未知';

  // 方案1: ipwhois.io (完全免费)
  if (ip && ip !== '未知' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      const response = await fetch(`https://ipwho.is/${ip}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return NextResponse.json({
          source: 'ipwhois',
          ip: data.ip,
          country: data.country_code,
          countryName: data.country,
          city: data.city,
          region: data.region,
          timezone: data.timezone.id,
          latitude: data.latitude,
          longitude: data.longitude,
          accurate: true
        });
      }
    } catch (error) {
      console.error('IP detection failed:', error);
    }
  }

  // 回退方案
  return NextResponse.json({
    source: 'vercel',
    ip,
    country: request.headers.get('x-vercel-ip-country') || 'US',
    city: '',
    region: '',
    accurate: false
  });
}