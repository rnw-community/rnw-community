---
name: ci-integration
description: GitHub Actions, GitLab CI, Maestro Cloud
metadata:
  tags: ci, cd, github-actions, gitlab, cloud
---

The GitHub-hosted `runs-on` values and app names below are generic reference material, not this
repository's configuration. For this repository's actual self-hosted fleet labels, workflow file
names, and artifact policy, see [rnw-community.md](rnw-community.md).

## GitHub Actions

### Basic Setup

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Start iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15 Pro"
          xcrun simctl bootstatus "iPhone 15 Pro" -b

      - name: Build iOS App
        run: |
          xcodebuild -workspace MyApp.xcworkspace \
            -scheme MyApp \
            -sdk iphonesimulator \
            -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
            -derivedDataPath build

      - name: Install App
        run: |
          xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/MyApp.app

      - name: Run E2E Tests
        run: maestro test e2e/

      - name: Upload Screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-screenshots
          path: maestro_output/
```

### Android

```yaml
jobs:
  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Set up Android
        uses: android-actions/setup-android@v3

      - name: Run Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 31
          script: maestro test e2e/
```

## GitLab CI

```yaml
# .gitlab-ci.yml
e2e:
  image: mobile-dev-inc/maestro:latest
  script:
    - maestro test e2e/
  artifacts:
    when: always
    paths:
      - maestro_output/
```

## Maestro Cloud

Run tests in the cloud without local infrastructure:

```bash
maestro cloud --apiKey $MAESTRO_API_KEY app.apk e2e/
```

### CI Integration

```yaml
- name: Run on Maestro Cloud
  env:
    MAESTRO_CLOUD_API_KEY: ${{ secrets.MAESTRO_CLOUD_API_KEY }}
  run: |
    maestro cloud \
      --apiKey $MAESTRO_CLOUD_API_KEY \
      --app app.apk \
      e2e/
```

## Environment Variables in CI

```yaml
- name: Run E2E Tests
  env:
    MAESTRO_TEST_USER: ${{ secrets.TEST_USER }}
    MAESTRO_TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
  run: |
    maestro test \
      -e USERNAME=$MAESTRO_TEST_USER \
      -e PASSWORD=$MAESTRO_TEST_PASSWORD \
      e2e/
```

## Parallelization

Run tests in parallel for faster execution:

```bash
maestro test --shards 4 --shard-index 0 e2e/
maestro test --shards 4 --shard-index 1 e2e/
maestro test --shards 4 --shard-index 2 e2e/
maestro test --shards 4 --shard-index 3 e2e/
```

### GitHub Actions Matrix

```yaml
jobs:
  e2e:
    strategy:
      matrix:
        shard: [0, 1, 2, 3]
    steps:
      - run: maestro test --shards 4 --shard-index ${{ matrix.shard }} e2e/
```

## Retry Failed Tests

```bash
maestro test --retries 2 e2e/
```

## Output Formats

### JUnit XML (for CI reporting)

```bash
maestro test --format junit e2e/
```

Generates `maestro-report.xml` compatible with most CI systems.
