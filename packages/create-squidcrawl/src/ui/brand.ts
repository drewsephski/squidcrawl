import { dimText } from './dim.js';

const SQUIDCRAWL_LOGO = [
  '╔══╗╦═╗╦ ╦║║╦═╗╔═╗╔═╗╔═╗╦ ╦╦',
  '║ ═╣╠╦╝║ ║║║╠╦╝║ ║╠═╝╠═╣╠ ╣║',
  '╚══╝╩╚═╚═╝╩╩╩╚═╚═╝║ ║╩ ╩╩ ╩╩',
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
