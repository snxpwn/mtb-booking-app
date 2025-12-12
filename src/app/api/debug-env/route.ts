
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasServiceKey = !!process.env.SERVICE_ACCOUNT_KEY_JSON;
  const keyLength = process.env.SERVICE_ACCOUNT_KEY_JSON ? process.env.SERVICE_ACCOUNT_KEY_JSON.length : 0;
  
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    hasServiceKey,
    keyLength,
    // Do not log the full key for security
    keyPreview: hasServiceKey ? process.env.SERVICE_ACCOUNT_KEY_JSON?.substring(0, 20) + '...' : 'N/A'
  });
}
