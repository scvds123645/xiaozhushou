import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // 先尝试 Vercel 的信息
  const vercelCountry = request.headers.get('x-vercel-ip-country') || '';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             '未知';
  
  // 如果有真实 IP,尝试使用免费的 IP 地理位置 API 获取更准确的信息
  if (ip && ip !== '未知' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      // 使用 ip-api.com (免费,每分钟45次请求限制)
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,lat,lon,timezone,query`, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        
        if (geoData.status === 'success') {
          return NextResponse.json({
            source: 'ip-api',
            ip: geoData.query || ip,
            country: geoData.countryCode || vercelCountry,
            countryName: geoData.country || '',
            city: geoData.city || '',
            region: geoData.regionName || '',
            timezone: geoData.timezone || '',
            latitude: geoData.lat || null,
            longitude: geoData.lon || null,
            accurate: true
          });
        }
      }
    } catch (error) {
      console.error('IP API failed, falling back to Vercel data:', error);
    }
  }
  
  // 回退到 Vercel 的数据
  return NextResponse.json({
    source: 'vercel',
    ip,
    country: vercelCountry,
    city: request.headers.get('x-vercel-ip-city') || '',
    region: request.headers.get('x-vercel-ip-country-region') || '',
    accurate: false
  });
}