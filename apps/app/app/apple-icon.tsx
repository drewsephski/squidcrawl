import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default function AppleIcon() {
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
        backgroundColor: '#000',
      }}
    >
      <img alt="" src={logoSrc} style={{ height: '65%', width: 'auto' }} />
    </div>,
    { ...size },
  );
}
