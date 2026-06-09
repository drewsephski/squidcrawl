import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderDeepcrawlHeader, renderDeepcrawlLogo } from '../ui/brand.js';

test('renderDeepcrawlLogo returns the Squidcrawl ASCII logo', () => {
  assert.equal(
    renderDeepcrawlLogo(),
    [
      '╔╦╗╔═╗╔═╗╔═╗╔═╗╦═╗╔═╗╦ ╦╦',
      ' ║║║╣ ║╣ ╠═╝║  ╠╦╝╠═╣║║║║',
      '═╩╝╚═╝╚═╝╩  ╚═╝╩╚═╩ ╩╚╩╝╩═╝',
    ].join('\n'),
  );
});

test('renderDeepcrawlHeader reuses the logo block', () => {
  assert.equal(
    renderDeepcrawlHeader(),
    [
      renderDeepcrawlLogo(),
      '',
      'squidcrawl.dev',
      'one command to deploy squidcrawl fullstack yourself',
    ].join('\n'),
  );
});
