// app/api/batch/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { extractFromUrl, ExtractOptions } from '@/lib/extractor'
import { checkRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BATCH = 10

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/batch',
    description: 'Extract clean text from multiple URLs in one request (max 10)',
    body: {
      urls: 'string[] (required) — up to 10 URLs',
      format: 'text | markdown | html | all  (default: all)',
      include_images: 'boolean  (default: false)',
      include_links: 'boolean  (default: true)',
      max_length: 'number  — truncate each result',
    },
  })
}

export async function POST(req: NextRequest) {
  const key =
    req.headers.get('x-rapidapi-user') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous'

  const rl = checkRateLimit(`batch:${key}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: { message: 'Rate limit exceeded for batch endpoint.' } },
      { status: 429 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid JSON body' } }, { status: 400 })
  }

  const { urls, format, include_images, include_links, max_length } = body as {
    urls?: unknown
    format?: string
    include_images?: boolean
    include_links?: boolean
    max_length?: number
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { success: false, error: { message: '"urls" must be a non-empty array' } },
      { status: 422 }
    )
  }

  if (urls.length > MAX_BATCH) {
    return NextResponse.json(
      { success: false, error: { message: `Maximum ${MAX_BATCH} URLs per batch request` } },
      { status: 422 }
    )
  }

  const options: ExtractOptions = {
    format: ((format ?? 'all') as ExtractOptions['format']),
    includeImages: include_images === true,
    includeLinks: include_links !== false,
    maxLength: max_length,
  }

  const results = await Promise.allSettled(
    (urls as string[]).map((url) => extractFromUrl(url, options))
  )

  const output = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { index: i, success: true, ...result.value }
    }
    return {
      index: i,
      success: false,
      url: (urls as string[])[i],
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
    }
  })

  const succeeded = output.filter((r) => r.success).length

  return NextResponse.json({
    success: true,
    summary: { total: urls.length, succeeded, failed: urls.length - succeeded },
    results: output,
  })
}
