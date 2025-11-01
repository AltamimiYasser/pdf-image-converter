import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PDF ↔ Image Converter',
  description: 'Convert between PDF and image formats in your browser',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

