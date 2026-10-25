import argparse
import json
import os
from pathlib import Path
import statistics
import shutil
import subprocess
import sys
import time


def measure(binary, arguments, directory, destination):
    with destination.open('w') as log:
        started = time.perf_counter()
        process = subprocess.Popen([str(binary), *arguments], cwd=directory, stdout=log, stderr=subprocess.STDOUT)
        _, status, usage = os.wait4(process.pid, 0)
        process.returncode = os.waitstatus_to_exitcode(status)
    return {
        'exit': process.returncode,
        'seconds': round(time.perf_counter() - started, 4),
        'peak_rss_mib': round(usage.ru_maxrss / (1024 * 1024 if sys.platform == 'darwin' else 1024), 2),
        'log': str(destination),
    }


def main():
    parser = argparse.ArgumentParser(
        description='Serial, interleaved tooling benchmarks with per-process peak RSS (Linux/macOS).'
    )
    parser.add_argument('mode', choices=['types', 'build', 'lint', 'native'])
    parser.add_argument('--runs', type=int, default=3)
    parser.add_argument('--output', default='.plans/tooling-profile')
    parser.add_argument('--incremental', action='store_true')
    parser.add_argument('--reference-eslint-config')
    arguments = parser.parse_args()
    if arguments.runs < 1:
        parser.error('--runs must be positive')
    if not hasattr(os, 'wait4'):
        parser.error('peak RSS measurement requires Linux or macOS')
    root = Path(__file__).resolve().parent.parent
    output = (root / arguments.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    binaries = root / 'node_modules/.bin'
    records = []
    packages = [
        (file.parent, json.loads(file.read_text()))
        for file in sorted((root / 'packages').glob('*/package.json'))
    ]
    for directory, package in packages:
        if arguments.mode == 'build':
            configs = sorted(directory.glob('tsconfig.build-*.json'))
            if 'react-native-builder-bob' in package:
                configs = [directory / 'tsconfig.build.json']
            for config in configs:
                label = f'{directory.name}-{config.stem}'
                candidates = []
                for tool in ['tsc', 'tsrs']:
                    flags = [
                        '-p', str(config), '--noEmit', 'false', '--incremental', 'false',
                        '--pretty', 'false', '--outDir', str(output / f'{tool}-{label}-output'),
                    ]
                    if config.name == 'tsconfig.build.json':
                        flags.extend(['--emitDeclarationOnly', 'true', '--declaration', 'true'])
                    candidates.append((tool, binaries / tool, flags))
                for round_index in range(arguments.runs):
                    for tool, binary, flags in candidates[::1 if round_index % 2 == 0 else -1]:
                        compiled = output / f'{tool}-{label}-output'
                        if compiled.exists():
                            shutil.rmtree(compiled)
                        result = measure(
                            binary, flags, directory, output / f'{tool}-{label}-{round_index}.log'
                        )
                        record = {'tool': tool, 'package': label, 'round': round_index, **result}
                        records.append(record)
                        print(json.dumps(record), flush=True)
            continue
        if arguments.mode == 'types' and 'ts' in package.get('scripts', {}):
            candidates = [
                (tool, binaries / tool, ['-p', 'tsconfig.json', '--noEmit', '--pretty', 'false'])
                for tool in ['tsc', 'tsrs']
            ]
            for tool, binary, flags in candidates:
                flags.extend(['--incremental', str(arguments.incremental).lower()])
                if arguments.incremental:
                    flags.extend(['--tsBuildInfoFile', str(output / f'{tool}-{directory.name}.tsbuildinfo')])
                    warmup = measure(binary, flags, directory, output / f'{tool}-{directory.name}-warmup.log')
                    if warmup['exit']:
                        parser.error(f'Compiler warmup failed: {warmup["log"]}')
        elif arguments.mode in ('lint', 'native') and 'lint' in package.get('scripts', {}):
            flags = [str(directory / 'src'), '--format', 'json']
            candidates = [
                ('eslint', binaries / 'eslint', flags),
                ('oxlint-package', binaries / 'oxlint', flags),
            ]
            if arguments.mode == 'native':
                candidates = [candidate for candidate in candidates if candidate[0] == 'oxlint-package']
            if arguments.mode == 'lint' and arguments.reference_eslint_config:
                reference = str((root / arguments.reference_eslint_config).resolve())
                candidates.insert(0, ('eslint-reference', binaries / 'eslint', ['--config', reference, *flags]))
        else:
            continue
        for round_index in range(arguments.runs):
            for tool, binary, flags in candidates[::1 if round_index % 2 == 0 else -1]:
                result = measure(
                    binary, flags, directory if arguments.mode == 'types' else root,
                    output / f'{tool}-{directory.name}-{round_index}.log'
                )
                record = {'tool': tool, 'package': directory.name, 'round': round_index, **result}
                records.append(record)
                print(json.dumps(record), flush=True)
    if arguments.mode in ('lint', 'native'):
        sources = [str(directory / 'src') for directory, package in packages if 'lint' in package.get('scripts', {})]
        candidates = [('oxlint', []), ('oxlint-fast', ['--config', '.oxlintrc.fast.json'])]
        for round_index in range(arguments.runs):
            for tool, flags in candidates[::1 if round_index % 2 == 0 else -1]:
                result = measure(
                    binaries / 'oxlint', [*flags, *sources, '--format', 'json'], root,
                    output / f'{tool}-{round_index}.log'
                )
                record = {'tool': tool, 'package': 'workspace', 'round': round_index, **result}
                records.append(record)
                print(json.dumps(record), flush=True)
    summary = {}
    for tool in sorted({record['tool'] for record in records}):
        selected = [record for record in records if record['tool'] == tool]
        summary[tool] = {
            'sum_package_medians_seconds': round(sum(
                statistics.median(record['seconds'] for record in selected if record['package'] == package)
                for package in {record['package'] for record in selected}
            ), 4),
            'largest_peak_rss_mib': max(record['peak_rss_mib'] for record in selected),
            'failed_runs': sum(record['exit'] != 0 for record in selected),
        }
    if arguments.mode == 'lint' and 'eslint' in summary:
        summary['full-lint'] = {
            'sum_package_medians_seconds': round(
                summary['eslint']['sum_package_medians_seconds']
                + summary['oxlint-package']['sum_package_medians_seconds'], 4
            ),
            'largest_peak_rss_mib': max(summary[tool]['largest_peak_rss_mib'] for tool in ['eslint', 'oxlint-package']),
            'failed_runs': sum(summary[tool]['failed_runs'] for tool in ['eslint', 'oxlint-package']),
        }
    (output / 'results.json').write_text(json.dumps({'summary': summary, 'runs': records}, indent=2) + '\n')
    print(json.dumps(summary, indent=2))
    return int(any(record['exit'] != 0 for record in records))


if __name__ == '__main__':
    sys.exit(main())
