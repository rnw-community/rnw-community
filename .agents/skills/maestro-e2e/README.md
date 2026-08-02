# Maestro Skills

Comprehensive Maestro E2E UI testing skill for AI coding assistants.

Vendored from [raphaelbarbosaqwerty/maestro-dev-skills](https://github.com/raphaelbarbosaqwerty/maestro-dev-skills) (MIT, see `LICENSE`), with [rules/rnw-community.md](rules/rnw-community.md) added on top for this repository's package layout, run scripts, fleet labels, and artifact locations.

## Installation

```bash
npx skills add raphaelbarbosaqwerty/maestro-dev-skills
```

Or via npm:

```bash
npm install @raphaelbarbosaqwerty/maestro-skills
```

## Platforms

- ✅ iOS (Simulator)
- ✅ Android (Emulator)
- ✅ Flutter
- ✅ React Native
- ✅ Web (Chromium)

## Usage

This skill provides comprehensive documentation for AI coding assistants to generate Maestro E2E tests. The main entry point is `SKILL.md`.

### Structure

```text
├── SKILL.md              # Main skill file with overview
└── rules/
    ├── installation.md
    ├── test-structure.md
    ├── commands.md       # 40+ Maestro commands
    ├── selectors.md
    ├── assertions.md
    ├── interactions.md
    ├── permissions.md
    ├── debugging.md
    ├── screenshots.md
    ├── ci-integration.md
    ├── best-practices.md
    ├── rnw-community.md   # this repository's package, scripts, fleet labels
    ├── platforms/
    │   ├── android.md
    │   ├── ios.md
    │   ├── flutter.md
    │   ├── react-native.md
    │   └── web.md
    └── advanced/
        ├── parameters.md
        ├── conditions.md
        ├── nested-flows.md
        ├── javascript.md
        ├── waiting.md
        └── repeat-retry.md
```

## Key Features

- **40+ Commands** - Complete reference for all Maestro commands
- **Platform-Specific** - Detailed guides for each platform
- **Flutter Integration** - Semantics.identifier patterns
- **CI/CD Ready** - GitHub Actions, Maestro Cloud integration
- **Best Practices** - Naming conventions, project structure

## License

MIT
