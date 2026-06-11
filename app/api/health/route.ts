// app/api/health/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Webpage Extractor API',
    version: '2.0.0',
    engine: 'Mozilla Readability + linkedom',
    endpoints: [
      { path: '/api/extract', method: 'POST', description: 'Extract clean article text from a single URL' },
      { path: '/api/batch',   method: 'POST', description: 'Extract from up to 10 URLs in one request' },
    ],
    timestamp: new Date().toISOString(),
  })
}
