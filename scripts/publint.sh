#!/usr/bin/env bash
set -euo pipefail

packages=(
    decorators-core
    eslint-plugin
    fast-style
    histogram-metric-decorator
    lock-decorator
    log-decorator
    nestjs-enterprise
    nestjs-rxjs-lock
    nestjs-rxjs-logger
    nestjs-rxjs-metrics
    nestjs-rxjs-redis
    nestjs-typed-config
    nestjs-webpack-swc
    object-field-tree
    platform
    react-native-collapsible-header
    react-native-screen-chrome
    react-native-payments
    redux-loadable
    rxjs-errors
    shared
    wdio
)

build_filters=()
for pkg in "${packages[@]}"; do
    build_filters+=("--filter=@rnw-community/${pkg}")
done
turbo run build "${build_filters[@]}"

for pkg in "${packages[@]}"; do
    echo ""
    echo "── @rnw-community/${pkg} ──"

    ignore_rules=()
    if [ "${pkg}" = "eslint-plugin" ]; then
        ignore_rules+=(named-exports)
    fi

    publint run "packages/${pkg}"
    if [ "${#ignore_rules[@]}" -gt 0 ]; then
        attw --pack "packages/${pkg}" --profile node16 --ignore-rules "${ignore_rules[@]}"
    else
        attw --pack "packages/${pkg}" --profile node16
    fi
done
