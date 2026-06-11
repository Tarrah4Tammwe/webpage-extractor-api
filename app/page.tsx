// app/page.tsx
export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Webpage Extractor API</h1>
      <p style={{ color: '#555', fontSize: 18, marginBottom: 8 }}>
        Extract clean article text from any URL. Powered by Mozilla Readability — the same engine behind Firefox Reader Mode.
      </p>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>
        Returns plain text, Markdown, or cleaned HTML with full metadata. Zero noise — no nav, no ads, no footer, no scripts.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 600 }}>POST /api/extract</h2>
      <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 14, marginBottom: 32 }}>
{`{
  "url": "https://example.com/article",
  "format": "markdown",      // text | markdown | html | all (default)
  "include_links": true,     // default: true
  "include_images": false,   // default: false
  "max_length": 5000         // optional character cap
}`}
      </pre>

      <h2 style={{ fontSize: 20, fontWeight: 600 }}>POST /api/batch</h2>
      <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 14, marginBottom: 32 }}>
{`{
  "urls": ["https://...", "https://..."],
  "format": "text"
}
// Up to 10 URLs per request, processed in parallel`}
      </pre>

      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Response includes</h2>
      <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 14 }}>
{`{
  "success": true,
  "url": "https://...",
  "metadata": {
    "title": "...",
    "description": "...",
    "author": "...",
    "published_date": "...",
    "site_name": "...",
    "language": "en",
    "word_count": 847,
    "reading_time_minutes": 4,
    "is_readerable": true
  },
  "text": "...",
  "markdown": "...",
  "html": "..."
}`}
      </pre>

      <p style={{ marginTop: 40, color: '#888' }}>
        Available on{' '}
        <a href="https://rapidapi.com/tarrah4tammwe" style={{ color: '#0070f3' }}>RapidAPI</a>
        {' · '}
        <a href="/api/health" style={{ color: '#0070f3' }}>Health check</a>
      </p>
    </main>
  )
}
