import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In a monorepo, point turbopack.root at the workspace root so it
// can resolve dependencies from the hoisted node_modules.
// Outside the monorepo (standalone usage), this won't be needed.
const repoRoot = path.join(__dirname, '../..');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  turbopack: {
    root: repoRoot,
  },
};

export default config;
