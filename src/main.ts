import { Scanner } from './scanner';
import { Analyzer } from './analyzer';

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
        sizeMB: Number(args.get('sizeMB') ?? 100),
        days: Number(args.get('days') ?? 30),
        paths: (args.get('paths') && typeof args.get('paths') === 'string')
            ? (args.get('paths') as string).split(',')
            : undefined,
        maxDepth: Number(args.get('maxDepth') ?? 4),
        maxFiles: Number(args.get('maxFiles') ?? 20000),
    };
}

async function main() {
    const opts = parseArgs(process.argv);
    const scanner = new Scanner({ maxDepth: opts.maxDepth, maxFiles: opts.maxFiles });
    const files = await scanner.scan(opts.paths);

    const analyzer = new Analyzer({ sizeThresholdMB: opts.sizeMB, ageThresholdDays: opts.days });
    const analysis = analyzer.analyze(files);

    if (opts.json) {
        console.log(JSON.stringify(analysis, null, 2));
    } else {
        console.log(analysis.report);
    }
}

main().catch(error => {
    console.error('Error running the application:', error);
});