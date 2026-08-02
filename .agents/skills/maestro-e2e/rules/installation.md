---
name: installation
description: Installing Maestro on macOS, Linux, and Windows
metadata:
  tags: install, setup, brew, curl, cli
---

## macOS (Homebrew)

```bash
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
```

## Linux / Windows (WSL)

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

After installation, add to PATH:

```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

## Verify Installation

```bash
maestro --version
```

## Upgrade

```bash
# macOS
brew upgrade maestro

# Linux
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Prerequisites

| Platform | Requirement                                 |
| -------- | ------------------------------------------- |
| iOS      | Xcode + iOS Simulator (macOS only)          |
| Android  | Android SDK + Emulator or device with ADB   |
| Web      | No prerequisites (Chromium auto-downloaded) |

## Troubleshooting

If `maestro` command not found after installation:

```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.zshrc
source ~/.zshrc
```
