import { dimText } from './dim.js';

const SQUIDCRAWL_LOGO = [
  ' ____   ___  _   _ ___ ____   ____ ____      ___        ___     ',
  '/ ___| / _ \\| | | |_ _|  _ \\ / ___|  _ \\    / \\ \\      / / |    ',
  '\\___ \\| | | | | | || || | | | |   | |_) |  / _ \\ \\ /\\ / /| |    ',
  ' ___) | |_| | |_| || || |_| | |___|  _ <  / ___ \\ V  V / | |___ ',
  '|____/ \\__\\_\\\\___/|___|____/ \\____|_| \\_\\/_/   \\_\\_/\\_/  |_____|',
].join('\n');

export function renderSquidcrawlLogo(): string {
  return SQUIDCRAWL_LOGO;
}

export function renderSquidcrawlHeader(): string {
  return [
    renderSquidcrawlLogo(),
    '',
    'squidcrawl.dev',
    dimText('one command to deploy squidcrawl fullstack yourself'),
  ].join('\n');
}
