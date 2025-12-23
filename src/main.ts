import { Scanner } from './scanner';
import { Analyzer } from './analyzer';
import { Deleter } from './deleter';
import { confirmDelete, createReadlineInterface } from './utils/prompt';
import { Category } from './types';

function parseArgs(argv: string[]) {
  const args = new Map<string, string | boolean>();
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.substring(2).split('=');
      args.set(k, v ?? true);
    }
  }
  return {
    json: args.get('json') === true,
    dryRun: args.get('dry-run') === true,
    confirmDelete: args.get('confirm-delete') === true,
    interactive: args.get('interactive') === true,
    sizeMB: Number(args.get('sizeMB') ?? 100),
    days: Number(args.get('days') ?? 30),
    paths: (args.get('paths') && typeof args.get('paths') === 'string')
      ? (args.get('paths') as string).split(',')
      : undefined,
    maxDepth: Number(args.get('maxDepth') ?? 4),
    maxFiles: Number(args.get('maxFiles') ?? 20000),
    excludePatterns: (args.get('exclude-patterns') && typeof args.get('exclude-patterns') === 'string')
      ? (args.get('exclude-patterns') as string).split(',')
      : undefined,
    onlyCategory: args.get('only-category') as Category | undefined,
  };
}

async function main() {
  const opts = parseArgs(process.argv);
  const scanner = new Scanner({ maxDepth: opts.maxDepth, maxFiles: opts.maxFiles });
  const files = await scanner.scan(opts.paths);

  const analyzer = new Analyzer({
    sizeThresholdMB: opts.sizeMB,
    ageThresholdDays: opts.days,
    excludePatterns: opts.excludePatterns,
    onlyCategory: opts.onlyCategory,
  });
  const analysis = analyzer.analyze(files);

  if (opts.json) {
    console.log(JSON.stringify(analysis, null, 2));
  } else {
    console.log(analysis.report);
  }

  // Handle deletion if requested
  if (opts.confirmDelete || opts.dryRun || opts.interactive) {
    if (analysis.suggestions.length === 0) {
      console.log('No suggestions to delete.');
      return;
    }

    let shouldDelete = opts.confirmDelete;
    if (opts.interactive && !opts.confirmDelete) {
      const rl = createReadlineInterface();
      shouldDelete = await confirmDelete(rl, analysis.suggestions.length);
      rl.close();
    }

    if (shouldDelete || opts.dryRun) {
      const deleter = new Deleter({ dryRun: opts.dryRun });
      const result = await deleter.delete(analysis.suggestions);
      if (!opts.json) {
        console.log(
          `\n${opts.dryRun ? 'DRY-RUN: ' : ''}${result.deleted} deleted, ${result.failed} failed, ${result.skipped} skipped`
        );
      }
    }
  }
}

main().catch(error => {
  console.error('Error running the application:', error);
});