// lib/extractor.ts
import { Readability, isProbablyReaderable } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

export interface Metadata {
  title: string
  description: string
  author: string
  publishedDate: string
  siteName: string
  language: string
  wordCount: number
  readingTimeMinutes: number
  extractedAt: string
  isReaderable: boolean
}

export interface ExtractResult {
  url: string
  metadata: Metadata
  text: string
  markdown: string
  html: string
}

export interface ExtractOptions {
  format?: 'text' | 'markdown' | 'html' | 'all'
  includeImages?: boolean
  includeLinks?: boolean
  maxLength?: number
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error(`Not an HTML page (content-type: ${contentType})`)
    }

    const html = await response.text()
    return { html, finalUrl: response.url || url }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out after 15 seconds')
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// OG / meta fallback extraction (for when Readability returns sparse metadata)
// ---------------------------------------------------------------------------

function extractOgMeta(html: string): {
  ogTitle: string
  ogDescription: string
  ogSiteName: string
  metaDescription: string
  publishedDate: string
  language: string
} {
  const get = (re: RegExp) => {
    const m = html.match(re)
    return m ? m[1].trim() : ''
  }

  return {
    ogTitle:
      get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,300})["']/i) ||
      get(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+property=["']og:title["']/i),
    ogDescription:
      get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,500})["']/i) ||
      get(/<meta[^>]+content=["']([^"']{1,500})["'][^>]+property=["']og:description["']/i),
    ogSiteName:
      get(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{1,100})["']/i) ||
      get(/<meta[^>]+content=["']([^"']{1,100})["'][^>]+property=["']og:site_name["']/i),
    metaDescription:
      get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,500})["']/i) ||
      get(/<meta[^>]+content=["']([^"']{1,500})["'][^>]+name=["']description["']/i),
    publishedDate:
      get(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']{1,50})["']/i) ||
      get(/<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"']{1,50})["']/i) ||
      get(/<time[^>]+datetime=["']([^"']{1,50})["']/i),
    language: (() => {
      const m = html.match(/<html[^>]+lang=["']([^"']{1,20})["']/i)
      return m ? m[1].split('-')[0].toLowerCase() : 'en'
    })(),
  }
}

// ---------------------------------------------------------------------------
// HTML → Markdown converter (runs on Readability's cleaned HTML output)
// ---------------------------------------------------------------------------

function readabilityHtmlToMarkdown(html: string, includeImages: boolean, includeLinks: boolean): string {
  let md = html

  // Headings
  for (let i = 6; i >= 1; i--) {
    const hashes = '#'.repeat(i)
    md = md.replace(new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi'), (_, t) => `\n${hashes} ${stripTags(t)}\n`)
  }

  // Bold / italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, c) => `**${stripTags(c)}**`)
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, c) => `_${stripTags(c)}_`)

  // Links
  if (includeLinks) {
    md = md.replace(/<a[^>]+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const t = stripTags(text).trim()
      if (!t || !href || href.startsWith('#')) return t
      return `[${t}](${href})`
    })
  } else {
    md = md.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, (_, t) => stripTags(t))
  }

  // Images
  if (includeImages) {
    md = md.replace(/<img[^>]+src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => `\n![${alt}](${src})\n`)
    md = md.replace(/<img[^>]+alt=["']([^"']*)["'][^>]+src=["']([^"']*)["'][^>]*\/?>/gi, (_, alt, src) => `\n![${alt}](${src})\n`)
    md = md.replace(/<img[^>]+src=["']([^"']*)["'][^>]*\/?>/gi, (_, src) => `\n![](${src})\n`)
  } else {
    // Keep alt text as context
    md = md.replace(/<img[^>]+alt=["']([^"']+)["'][^>]*\/?>/gi, (_, alt) => `[Image: ${alt}]`)
    md = md.replace(/<img[^>]*\/?>/gi, '')
  }

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${stripTags(t).trim()}`)
  md = md.replace(/<\/?(ul|ol)[^>]*>/gi, '\n')

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) =>
    stripTags(t).split('\n').map((l: string) => `> ${l.trim()}`).filter((l: string) => l !== '> ').join('\n')
  )

  // Code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, t) => `\n\`\`\`\n${decodeEntities(stripTags(t))}\n\`\`\`\n`)
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, t) => `\n\`\`\`\n${decodeEntities(stripTags(t))}\n\`\`\`\n`)
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${stripTags(t)}\``)

  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n')

  // Block elements → newlines
  md = md.replace(/<\/?(?:p|div|section|article|br|tr)[^>]*>/gi, '\n')

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '')

  return normalise(decodeEntities(md))
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\u00a0/g, ' ')
}

function normalise(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function extractFromUrl(url: string, options: ExtractOptions = {}): Promise<ExtractResult> {
  const { format = 'all', includeImages = false, includeLinks = true, maxLength } = options

  // Validate URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only http and https URLs are supported')
    }
  } catch {
    throw new Error('Invalid URL: must be a valid http or https address')
  }

  // Fetch
  const { html: rawHtml, finalUrl } = await fetchHtml(url)

  // Parse DOM with linkedom
  const { document } = parseHTML(rawHtml)

  // Set baseURI so Readability can resolve relative URLs
  // linkedom uses document.URL — set it via the constructor arg
  // We re-parse with the base URL set correctly
  const { document: doc } = parseHTML(rawHtml, { url: finalUrl })

  // Check readability
  const readerable = isProbablyReaderable(doc)

  // Run Readability
  // Clone the document since Readability mutates it
  const { document: docForReading } = parseHTML(rawHtml, { url: finalUrl })
  const reader = new Readability(docForReading, {
    keepClasses: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serializer: (el: any) => (el as any).innerHTML ?? '',
  })
  const article = reader.parse()

  // OG meta fallback
  const ogMeta = extractOgMeta(rawHtml)

  // Assemble metadata (Readability result takes priority, OG as fallback)
  const title = article?.title || ogMeta.ogTitle || ''
  const description = ogMeta.ogDescription || ogMeta.metaDescription || article?.excerpt || ''
  const author = article?.byline || ''
  const siteName = article?.siteName || ogMeta.ogSiteName || parsedUrl.hostname.replace(/^www\./, '')
  const publishedDate = ogMeta.publishedDate || ''
  const language = ogMeta.language || 'en'

  // If Readability couldn't extract content, fall back to body text
  const contentHtml = article?.content ?? (() => {
    const { document: d } = parseHTML(rawHtml)
    // Strip obvious junk
    ;['script','style','nav','header','footer','aside','noscript'].forEach(tag => {
      d.querySelectorAll(tag).forEach((el: { remove: () => void }) => el.remove())
    })
    return d.querySelector('body')?.innerHTML ?? rawHtml
  })()

  // Generate text output
  const textContent = normalise(decodeEntities(
    contentHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<\/?(?:p|div|br|tr|li|h[1-6]|blockquote|pre|section|article)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  ))

  // Generate markdown output
  const markdownContent = readabilityHtmlToMarkdown(contentHtml, includeImages, includeLinks)

  // Word count + reading time from plain text
  const wordCount = countWords(textContent)
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 238))

  const truncate = (s: string) => maxLength ? s.slice(0, maxLength) : s

  return {
    url: finalUrl,
    metadata: {
      title,
      description,
      author,
      publishedDate,
      siteName,
      language,
      wordCount,
      readingTimeMinutes,
      extractedAt: new Date().toISOString(),
      isReaderable: readerable,
    },
    text: truncate(textContent),
    markdown: truncate(markdownContent),
    html: truncate(contentHtml),
  }
}
