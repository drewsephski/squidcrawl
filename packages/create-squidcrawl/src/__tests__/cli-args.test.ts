import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { parseCliArgs } from '../lib/cli-args.js';
import {
  DEFAULT_TEMPLATE_BRANCH,
  DEFAULT_TEMPLATE_REPO,
  resolveTemplateSourceConfig,
} from '../lib/template-source.js';

test('parseCliArgs supports default mode', () => {
  assert.deepEqual(parseCliArgs([]), {
    dryRun: false,
  });
});

test('parseCliArgs accepts a positional target path', () => {
  assert.deepEqual(parseCliArgs(['../my-app']), {
    dryRun: false,
    targetPath: '../my-app',
  });
});

test('parseCliArgs ignores standalone pnpm argument separator', () => {
  assert.deepEqual(
    parseCliArgs([
      '--',
      '../my-app',
      '--template-branch',
      'feat/create-squidcrawl',
    ]),
    {
      dryRun: false,
      targetPath: '../my-app',
      templateBranch: 'feat/create-squidcrawl',
    },
  );
});

test('parseCliArgs rejects more than one positional target path', () => {
  assert.throws(
    () => parseCliArgs(['../my-app', '../my-other-app']),
    /Only one target path may be provided/,
  );
});

test('parseCliArgs supports official repo branch override', () => {
  assert.deepEqual(
    parseCliArgs(['--template-branch', 'feat/create-squidcrawl']),
    {
      dryRun: false,
      templateBranch: 'feat/create-squidcrawl',
    },
  );
});

test('parseCliArgs supports template source override', () => {
  assert.deepEqual(
    parseCliArgs([
      '../my-app',
      '--dry-run',
      '--template-source',
      '/tmp/squidcrawl',
      '--template-branch',
      'feat/create-squidcrawl',
    ]),
    {
      dryRun: true,
      targetPath: '../my-app',
      templateSource: '/tmp/squidcrawl',
      templateBranch: 'feat/create-squidcrawl',
    },
  );
});

test('parseCliArgs rejects template-source without template-branch', () => {
  assert.throws(
    () => parseCliArgs(['--template-source', '/tmp/squidcrawl']),
    /--template-source override requires --template-branch/,
  );
});

test('resolveTemplateSourceConfig uses official template defaults', () => {
  assert.deepEqual(
    resolveTemplateSourceConfig({
      cwd: '/tmp',
    }),
    {
      source: DEFAULT_TEMPLATE_REPO,
      branch: DEFAULT_TEMPLATE_BRANCH,
      isOverride: false,
      sourceKind: 'official',
    },
  );
});

test('resolveTemplateSourceConfig uses official repo when only branch is overridden', () => {
  assert.deepEqual(
    resolveTemplateSourceConfig({
      cwd: '/tmp',
      templateBranch: 'feat/create-squidcrawl',
    }),
    {
      source: DEFAULT_TEMPLATE_REPO,
      branch: 'feat/create-squidcrawl',
      isOverride: true,
      sourceKind: 'official',
    },
  );
});

test('resolveTemplateSourceConfig resolves local paths for internal override', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'create-squidcrawl-cli-'));
  const localRepo = join(cwd, 'repo');

  assert.deepEqual(
    resolveTemplateSourceConfig({
      cwd,
      templateSource: localRepo,
      templateBranch: 'feat/create-squidcrawl',
    }),
    {
      source: localRepo,
      branch: 'feat/create-squidcrawl',
      isOverride: true,
      sourceKind: 'local',
    },
  );
});
