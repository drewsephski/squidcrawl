import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import '@deepcrawl/ui/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DeployAttributionBanner } from '@/components/deploy-attribution-banner';
import { Providers } from '@/components/providers';
import { META_THEME_COLORS, siteConfig } from '@/lib/site-config';

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
let metadataBaseUrl = new URL(siteConfig.url);

if (rawAppUrl) {
  try {
    metadataBaseUrl = new URL(rawAppUrl);
  } catch {
    metadataBaseUrl = new URL(siteConfig.url);
  }
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: metadataBaseUrl,
  description: siteConfig.description,
  keywords: [siteConfig.name, 'AI', 'Open Source', 'Toolkit', 'Agents'],
  authors: [
    {
      name: 'Drew Sepeczi',
      url: 'https://instagram.com/drew.sepeczi',
    },
  ],
  creator: 'drew.sepeczi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: metadataBaseUrl.href,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@drew.sepeczi',
  },
};

/** TODO: FIX THIS
 * The resource http://localhost:3000/_next/static/media/Geist_Variable-s.p.f19e4721.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* React Scan */}
        {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {/* Theme color matches bg-background from globals.css */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }
              } catch (_) {}
            `,
          }}
        />
        <meta content={META_THEME_COLORS.light} name="theme-color" />
        {/* Status bar style for iOS */}
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="yes" name="mobile-web-app-capable" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <DeployAttributionBanner />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
