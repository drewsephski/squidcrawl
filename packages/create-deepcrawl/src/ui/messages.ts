export function getCancelMessage(): string {
  return [
    'Squidcrawl setup cancelled.',
    'No folder or project was created.',
  ].join('\n');
}
