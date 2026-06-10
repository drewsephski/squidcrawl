import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default function OpenGraphImage() {
  const logoPath = join(process.cwd(), 'public', 'squidcrawl-logo.png');
  const logoSrc = `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
      }}
    >
      <img alt="" src={logoSrc} style={{ height: '300px', width: 'auto' }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1
          style={{
            fontSize: '80px',
            color: '#fff',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {siteConfig.name}
        </h1>
        <p
          style={{
            fontSize: '28px',
            color: '#888',
            margin: '20px 0 0 0',
            lineHeight: 1.4,
            maxWidth: '600px',
          }}
        >
          {siteConfig.description?.split('.')[0]}.
        </p>
      </div>
    </div>,
    { ...size },
  );
}
