import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderSquidcrawlHeader, renderSquidcrawlLogo } from '../ui/brand.js';

test('renderSquidcrawlLogo returns the Squidcrawl ASCII logo', () => {
  assert.ok(renderSquidcrawlLogo().includes('____'));
});

test('renderSquidcrawlHeader reuses the logo block', () => {
  assert.ok(renderSquidcrawlHeader().includes(renderSquidcrawlLogo()));
});
