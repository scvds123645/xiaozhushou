import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US';
  const response = NextResponse.next();
  
  // 将国家代码添加到响应头
  response.headers.set('x-user-country', country);
  
  return response;
}

export const config = {
  matcher: '/',
};