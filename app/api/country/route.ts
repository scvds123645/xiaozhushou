import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Vercel 会自动注入这些头信息
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('x-user-country') || 
                  'US';
  
  return NextResponse.json({ country });
}