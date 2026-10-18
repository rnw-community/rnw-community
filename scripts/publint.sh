#!/usr/bin/env bash
set -euo pipefail

mapfile -t package_dirs < <(pnpm ls -r --depth -1 --json | node -e '
    for (const pkg of JSON.parse(require("node:fs").readFileSync(0, "utf8"))) {
        if (!pkg.private) console.log(require("node:path").relative(process.cwd(), pkg.path));
    }
')
if [ "${#package_dirs[@]}" -eq 0 ]; then
    echo "no publishable packages found" >&2
    exit 1
fi

turbo run build "${package_dirs[@]/#/--filter=./}"

for dir in "${package_dirs[@]}"; do
    echo ""
    echo "── ${dir} ──"

    attw_args=(--pack "${dir}" --profile node16)
    if [ "${dir}" = "packages/eslint-plugin" ]; then
        attw_args+=(--ignore-rules named-exports)
    fi

    publint run "${dir}"
    attw "${attw_args[@]}"
done
