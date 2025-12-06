import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface IPApiResponse {
  status?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  query?: string;
}

interface IPWhoIsResponse {
  success?: boolean;
  ip?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: {
    id?: string;
  };
}

interface IPInfoResponse {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  timezone?: string;
}

export async function GET(request: NextRequest) {
  // 获取真实 IP 地址
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIP || 
             (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 
             realIP || 
             '未知';

  // 检查是否为有效的公网 IP
  const isValidPublicIP = (ipAddr: string): boolean => {
    if (ipAddr === '未知' || !ipAddr) return false;
    
    // 排除内网 IP
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^localhost$/i,
      /^::1$/,
      /^fe80:/i
    ];
    
    return !privateRanges.some(pattern => pattern.test(ipAddr));
  };

  if (!isValidPublicIP(ip)) {
    return NextResponse.json({
      source: 'header',
      ip: ip,
      country: 'US',
      countryName: 'United States',
      city: '',
      region: '',
      timezone: '',
      latitude: null,
      longitude: null,
      accurate: false,
      error: '无法检测到有效的公网 IP 地址'
    });
  }

  // 方案 1: ipwhois.io (完全免费，无需 API key)
  try {
    const response = await fetch(`https://ipwho.is/${ip}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data: IPWhoIsResponse = await response.json();
      
      if (data.success && data.country_code) {
        return NextResponse.json({
          source: 'ipwhois',
          ip: data.ip || ip,
          country: data.country_code,
          countryName: data.country,
          city: data.city || '',
          region: data.region || '',
          timezone: data.timezone?.id || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          accurate: true
        });
      }
    }
  } catch (error) {
    console.error('ipwhois.io 请求失败:', error);
  }

  // 方案 2: ip-api.com (免费，限制：每分钟 45 次请求)
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,query`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data: IPApiResponse = await response.json();
      
      if (data.status === 'success' && data.countryCode) {
        return NextResponse.json({
          source: 'ip-api',
          ip: data.query || ip,
          country: data.countryCode,
          countryName: data.country,
          city: data.city || '',
          region: data.regionName || data.region || '',
          timezone: data.timezone || '',
          latitude: data.lat || null,
          longitude: data.lon || null,
          accurate: true
        });
      }
    }
  } catch (error) {
    console.error('ip-api.com 请求失败:', error);
  }

  // 方案 3: ipapi.co (免费，限制：每天 1000 次请求)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data: any = await response.json();
      
      if (data.country_code && !data.error) {
        return NextResponse.json({
          source: 'ipapi.co',
          ip: data.ip || ip,
          country: data.country_code,
          countryName: data.country_name,
          city: data.city || '',
          region: data.region || '',
          timezone: data.timezone || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          accurate: true
        });
      }
    }
  } catch (error) {
    console.error('ipapi.co 请求失败:', error);
  }

  // 方案 4: ipinfo.io (免费，限制：每月 50000 次请求)
  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data: IPInfoResponse = await response.json();
      
      if (data.country) {
        const [lat, lon] = data.loc?.split(',').map(Number) || [null, null];
        
        return NextResponse.json({
          source: 'ipinfo',
          ip: data.ip || ip,
          country: data.country,
          countryName: data.country,
          city: data.city || '',
          region: data.region || '',
          timezone: data.timezone || '',
          latitude: lat,
          longitude: lon,
          accurate: true
        });
      }
    }
  } catch (error) {
    console.error('ipinfo.io 请求失败:', error);
  }

  // 所有方案都失败，返回基础信息
  return NextResponse.json({
    source: 'fallback',
    ip: ip,
    country: 'US',
    countryName: 'United States',
    city: '',
    region: '',
    timezone: '',
    latitude: null,
    longitude: null,
    accurate: false,
    error: '所有 IP 检测服务暂时不可用'
  });
}