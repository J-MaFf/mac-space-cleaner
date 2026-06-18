import { Scanner } from './scanner';
import { Analyzer } from './analyzer';
import { Deleter } from './deleter';
import { confirmDelete, createReadlineInterface } from './utils/prompt';
import { Category, Suggestion } from './types';

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
    autoDelete: args.get('auto-delete') === true,
    interactive: args.get('interactive') === true,
    yes: args.get('yes') === true,
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

function fmtBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

// Show the actual ~/.Trash paths (a capped sample) before any bulk deletion so
// the user always sees WHAT is being removed from Trash, not just a count.
function printTrashPaths(suggestions: Suggestion[], sampleSize = 20): void {
  const trash = suggestions.filter(s => s.category === 'trash');
  if (trash.length === 0) return;

  const totalSize = trash.reduce((acc, s) => acc + s.file.size, 0);
  console.log(`\nTrash: ${trash.length} item(s), ${fmtBytes(totalSize)} to be deleted:`);

  const shown = trash.slice(0, sampleSize);
  for (const s of shown) {
    console.log(`  - ${s.file.path} (${fmtBytes(s.file.size)})`);
  }
  if (trash.length > shown.length) {
    console.log(`  ... and ${trash.length - shown.length} more Trash item(s) not shown`);
  }
}

// Print an overall pre-delete summary (total reclaimable size + top-N paths)
// so that even a non-interactive --yes/--auto-delete run announces what it is
// about to remove before any deletion happens (issue #5).
function printPreDeleteSummary(suggestions: Suggestion[], topN = 10): void {
  const totalSize = suggestions.reduce((acc, s) => acc + s.file.size, 0);
  console.log(
    `\nPre-delete summary: ${suggestions.length} file(s), ${fmtBytes(totalSize)} reclaimable.`
  );
  const top = suggestions.slice(0, topN); // already sorted by score then size
  if (top.length) {
    console.log(`Top ${top.length} by impact:`);
    for (const s of top) {
      console.log(`  - [${s.category}] ${s.file.path} (${fmtBytes(s.file.size)}) — ${s.reason}`);
    }
    if (suggestions.length > top.length) {
      console.log(`  ... and ${suggestions.length - top.length} more`);
    }
  }
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
  if (opts.confirmDelete || opts.dryRun || opts.interactive || opts.yes || opts.autoDelete) {
    if (analysis.suggestions.length === 0) {
      console.log('No suggestions to delete.');
      return;
    }

    // Always surface the actual Trash paths before bulk deletion, including in
    // non-interactive --yes/--auto-delete mode (issue #4).
    printTrashPaths(analysis.suggestions);

    // Non-interactive deletion (no prompt) only when explicitly requested via
    // --auto-delete or --yes. --confirm-delete now ALWAYS shows a confirmation
    // prompt, matching the safety expectation set by its name.
    let shouldDelete = opts.autoDelete || opts.yes;

    // Non-interactive delete (--yes/--auto-delete) prints a full pre-delete
    // summary so a no-prompt run still announces what it will remove (issue #5).
    if (shouldDelete) {
      printPreDeleteSummary(analysis.suggestions);
    }

    // --confirm-delete (and --interactive) require an interactive y/N prompt.
    if ((opts.confirmDelete || opts.interactive) && !shouldDelete) {
      const rl = createReadlineInterface();
      shouldDelete = await confirmDelete(rl, analysis.suggestions.length);
      rl.close();
    }

    if (shouldDelete || opts.dryRun) {
      const deleter = new Deleter({ dryRun: opts.dryRun });
      const result = await deleter.delete(analysis.suggestions);
      if (!opts.json) {
        console.log(
          `\n${opts.dryRun ? 'DRY-RUN: ' : ''}${result.deleted} deleted, ${result.failed} failed, ${result.skipped} skipped${result.blocked ? `, ${result.blocked} blocked (outside home dir)` : ''}`
        );
      }
    }
  }
}

main().catch(error => {
  console.error('Error running the application:', error);
});