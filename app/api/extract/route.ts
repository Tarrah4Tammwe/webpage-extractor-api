// app/api/extract/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { extractFromUrl } from '@/lib/extractor'
import { checkRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'
export const maxDuration = 30

function clientKey(req: NextRequest): string {
  return (
    req.headers.get('x-rapidapi-user') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  )
}

function err(message: string, status: number, details?: string) {
  return NextResponse.json(
    { success: false, error: { message, ...(details ? { details } : {}) } },
    { status }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url')
  if (!urlParam) {
    return NextResponse.json({
      endpoint: 'POST /api/extract',
      description: 'Extract clean article text from any webpage',
      body: {
        url: 'string (required)',
        format: 'text | markdown | html | all  (default: all)',
        include_images: 'boolean  (default: false)',
        include_links: 'boolean  (default: true)',
        max_length: 'number  — truncate output to N characters',
      },
    })
  }
  // Allow GET ?url= for quick testing
  const syntheticReq = new NextRequest(req.url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: urlParam, format: req.nextUrl.searchParams.get('format') || 'all' }),
  })
  return POST(syntheticReq)
}

export async function POST(req: NextRequest) {
  const key = clientKey(req)
  const rl = checkRateLimit(key, 10, 60_000)

  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: { message: 'Rate limit exceeded. Retry after the reset window.' } },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return err('Request body must be valid JSON', 400)
  }

  const { url, format, include_images, include_links, max_length } = body as {
    url?: string
    format?: string
    include_images?: boolean
    include_links?: boolean
    max_length?: number
  }

  if (!url) return err('Missing required field: url', 422)
  if (typeof url !== 'string') return err('"url" must be a string', 422)

  const validFormats = ['text', 'markdown', 'html', 'all']
  const resolvedFormat = format ?? 'all'
  if (!validFormats.includes(resolvedFormat)) {
    return err(`Invalid format "${resolvedFormat}"`, 422, `Must be one of: ${validFormats.join(', ')}`)
  }

  if (max_length !== undefined && (typeof max_length !== 'number' || max_length < 100)) {
    return err('max_length must be a number ≥ 100', 422)
  }

  try {
    const result = await extractFromUrl(url, {
      format: resolvedFormat as 'text' | 'markdown' | 'html' | 'all',
      includeImages: include_images === true,
      includeLinks: include_links !== false,
      maxLength: max_length,
    })

    const data: Record<string, unknown> = {
      success: true,
      url: result.url,
      metadata: result.metadata,
    }

    if (resolvedFormat === 'text')     { data.text = result.text }
    else if (resolvedFormat === 'markdown') { data.markdown = result.markdown }
    else if (resolvedFormat === 'html')     { data.html = result.html }
    else {
      data.text = result.text
      data.markdown = result.markdown
      data.html = result.html
    }

    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Extraction failed'
    if (msg.includes('Invalid URL'))    return err(msg, 422)
    if (msg.includes('timed out'))      return err(msg, 504)
    if (msg.includes('HTTP 4'))         return err(`Target page returned an error: ${msg}`, 400)
    if (msg.includes('HTTP 5'))         return err(`Target server error: ${msg}`, 502)
    if (msg.includes('Not an HTML'))    return err(msg, 422)
    return err('Extraction failed', 500, msg)
  }
}
