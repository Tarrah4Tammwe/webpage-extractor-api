export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0b0b0f; color: #e8e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .hero {
          padding: 80px 24px 64px;
          max-width: 860px;
          margin: 0 auto;
        }
        .badge {
          display: inline-block;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.4);
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 24px;
        }
        h1 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }
        h1 span {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          font-size: 18px;
          color: #9090a8;
          line-height: 1.6;
          max-width: 560px;
          margin-bottom: 40px;
        }
        .cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn-primary {
          background: #7c3aed;
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #6d28d9; }
        .btn-secondary {
          color: #9090a8;
          font-size: 14px;
          text-decoration: none;
          padding: 12px 4px;
        }

        .section { max-width: 860px; margin: 0 auto; padding: 0 24px 64px; }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 16px;
        }
        h2 { font-size: 28px; font-weight: 700; margin-bottom: 32px; letter-spacing: -0.01em; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        .feature-card {
          background: #13131a;
          border: 1px solid #1e1e2e;
          border-radius: 12px;
          padding: 20px;
        }
        .feature-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #e8e8f0;
          margin-bottom: 6px;
        }
        .feature-card-desc {
          font-size: 12px;
          color: #606078;
          line-height: 1.5;
        }
        .feat-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          background: #7c3aed;
        }
        .feat-dot.blue { background: #3b82f6; }
        .feat-dot.green { background: #10b981; }
        .feat-dot.orange { background: #f59e0b; }
        .feat-dot.pink { background: #ec4899; }

        .endpoint-block {
          background: #13131a;
          border: 1px solid #1e1e2e;
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #1e1e2e;
        }
        .method-badge {
          background: rgba(139,92,246,0.2);
          color: #a78bfa;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .endpoint-path {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 14px;
          color: #e8e8f0;
          font-weight: 500;
        }
        .endpoint-desc {
          padding: 12px 20px 0;
          font-size: 13px;
          color: #9090a8;
          line-height: 1.5;
        }
        .code-block {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.7;
          padding: 20px;
          color: #c9d1d9;
          overflow-x: auto;
        }
        .key { color: #79c0ff; }
        .str { color: #a8ff78; }
        .num { color: #f78166; }
        .comment { color: #484860; }

        .divider {
          border: none;
          border-top: 1px solid #1e1e2e;
          margin: 0 20px;
        }

        .response-block {
          background: #0d0d12;
          border: 1px solid #1e1e2e;
          border-radius: 12px;
          overflow: hidden;
        }
        .response-header {
          padding: 12px 20px;
          border-bottom: 1px solid #1e1e2e;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
        .status-text { font-size: 12px; color: #10b981; font-weight: 600; font-family: monospace; }

        .footer {
          max-width: 860px;
          margin: 0 auto;
          padding: 32px 24px 64px;
          border-top: 1px solid #1e1e2e;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-text { font-size: 13px; color: #40405a; }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-size: 13px; color: #60607a; text-decoration: none; }
        .footer-links a:hover { color: #a78bfa; }
      `}</style>

      {/* Hero */}
      <div className="hero">
        <div className="badge">REST API</div>
        <h1>
          Any URL.<br />
          <span>Clean article text.</span>
        </h1>
        <p className="subtitle">
          Send a URL, get back clean article text, Markdown, and metadata — stripped of all ads, nav, and boilerplate. Powered by Mozilla Readability.
        </p>
        <div className="cta-row">
          <a className="btn-primary" href="https://rapidapi.com/tarrah4tammwe" target="_blank" rel="noopener">Try on RapidAPI</a>
          <a className="btn-secondary" href="/api/health">Health check →</a>
        </div>
      </div>

      {/* What you get */}
      <div className="section">
        <p className="section-label">What you get</p>
        <h2>Three formats. Full metadata.</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-name"><span className="feat-dot"></span>Plain text</div>
            <div className="feature-card-desc">Clean prose, no tags. Ready to feed into LLMs, search indexes, or NLP pipelines.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-name"><span className="feat-dot blue"></span>Markdown</div>
            <div className="feature-card-desc">Headings, bold, lists, links, and code blocks preserved. Ideal for AI context windows.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-name"><span className="feat-dot green"></span>Cleaned HTML</div>
            <div className="feature-card-desc">Article HTML only — scripts, styles, ads, nav, and footers removed.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-name"><span className="feat-dot orange"></span>Metadata</div>
            <div className="feature-card-desc">Title, author, published date, site name, language, word count, and reading time.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-name"><span className="feat-dot pink"></span>Batch endpoint</div>
            <div className="feature-card-desc">Extract up to 10 URLs in one request, processed in parallel.</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-name"><span className="feat-dot"></span>Firefox-grade engine</div>
            <div className="feature-card-desc">Mozilla Readability — the same algorithm that powers Firefox Reader Mode on billions of pages.</div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="section">
        <p className="section-label">Endpoints</p>
        <h2>Two endpoints. Simple integration.</h2>

        <div className="endpoint-block">
          <div className="endpoint-header">
            <span className="method-badge">POST</span>
            <span className="endpoint-path">/api/extract</span>
          </div>
          <p className="endpoint-desc">Extract clean text from a single URL. Choose your output format.</p>
          <div className="code-block">
            <span className="comment">// Request body</span>{'\n'}
            {'{'}{'\n'}
            {'  '}<span className="key">"url"</span>: <span className="str">"https://example.com/article"</span>,{'\n'}
            {'  '}<span className="key">"format"</span>: <span className="str">"markdown"</span>,{'  '}<span className="comment">// text | markdown | html | all</span>{'\n'}
            {'  '}<span className="key">"include_links"</span>: <span className="num">true</span>,{'\n'}
            {'  '}<span className="key">"max_length"</span>: <span className="num">5000</span>{'  '}<span className="comment">// optional character cap</span>{'\n'}
            {'}'}
          </div>
        </div>

        <div className="endpoint-block">
          <div className="endpoint-header">
            <span className="method-badge">POST</span>
            <span className="endpoint-path">/api/batch</span>
          </div>
          <p className="endpoint-desc">Extract from up to 10 URLs in one request, all processed in parallel.</p>
          <div className="code-block">
            <span className="comment">// Request body</span>{'\n'}
            {'{'}{'\n'}
            {'  '}<span className="key">"urls"</span>: [<span className="str">"https://..."</span>, <span className="str">"https://..."</span>],{'\n'}
            {'  '}<span className="key">"format"</span>: <span className="str">"text"</span>{'\n'}
            {'}'}
          </div>
        </div>
      </div>

      {/* Response */}
      <div className="section">
        <p className="section-label">Response</p>
        <h2>Clean JSON, every time.</h2>
        <div className="response-block">
          <div className="response-header">
            <span className="status-dot"></span>
            <span className="status-text">200 OK</span>
          </div>
          <div className="code-block">
            {'{'}{'\n'}
            {'  '}<span className="key">"success"</span>: <span className="num">true</span>,{'\n'}
            {'  '}<span className="key">"url"</span>: <span className="str">"https://example.com/article"</span>,{'\n'}
            {'  '}<span className="key">"metadata"</span>: {'{'}{'\n'}
            {'    '}<span className="key">"title"</span>: <span className="str">"How to Fix a Leaky Tap"</span>,{'\n'}
            {'    '}<span className="key">"author"</span>: <span className="str">"Jane Smith"</span>,{'\n'}
            {'    '}<span className="key">"published_date"</span>: <span className="str">"2024-06-01T09:00:00Z"</span>,{'\n'}
            {'    '}<span className="key">"site_name"</span>: <span className="str">"HomeRepairGuide"</span>,{'\n'}
            {'    '}<span className="key">"language"</span>: <span className="str">"en"</span>,{'\n'}
            {'    '}<span className="key">"word_count"</span>: <span className="num">847</span>,{'\n'}
            {'    '}<span className="key">"reading_time_minutes"</span>: <span className="num">4</span>,{'\n'}
            {'    '}<span className="key">"is_readerable"</span>: <span className="num">true</span>{'\n'}
            {'  '}{'}'},  {'\n'}
            {'  '}<span className="key">"text"</span>: <span className="str">"A dripping tap wastes thousands of litres..."</span>,{'\n'}
            {'  '}<span className="key">"markdown"</span>: <span className="str">"## How to Fix a Leaky Tap\n\nA dripping tap..."</span>{'\n'}
            {'}'}
          </div>
        </div>
      </div>

      <footer className="footer">
        <span className="footer-text">Webpage Extractor API — built for developers</span>
        <div className="footer-links">
          <a href="/api/health">Health</a>
          <a href="https://rapidapi.com/tarrah4tammwe" target="_blank" rel="noopener">RapidAPI</a>
        </div>
      </footer>
    </>
  )
}
