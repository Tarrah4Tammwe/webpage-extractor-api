// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webpage Extractor API',
  description: 'Extract clean article text from any URL. Powered by Mozilla Readability.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
