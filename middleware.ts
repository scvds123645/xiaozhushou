import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 从请求头获取地理位置信息 (Vercel 自动注入)
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const response = NextResponse.next();
  
  // 将国家代码添加到响应头
  response.headers.set('x-user-country', country);
  
  return response;
}

export const config = {
  matcher: '/',
};