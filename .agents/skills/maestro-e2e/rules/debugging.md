---
name: debugging
description: Maestro Studio, hierarchy inspection, troubleshooting
metadata:
  tags: debug, studio, hierarchy, troubleshooting
---

## Maestro Studio

Interactive visual debugging tool:

```bash
# Mobile (iOS/Android)
maestro studio

# Web
maestro -p web studio
```

### Features

- Live UI hierarchy view
- Click elements to generate selectors
- Record interactions as YAML
- Real-time flow editing

## UI Hierarchy Inspection

View all visible elements and their properties:

```bash
maestro hierarchy
```

Output shows:

- Element types
- Text content
- IDs / accessibilityIdentifiers
- Bounds (position/size)
- Enabled/selected state

### Filter Hierarchy

```bash
maestro hierarchy | grep "login"
```

## Common Issues

### Element Not Found

**Symptoms:** `Could not find element`

**Solutions:**

1. Run `maestro hierarchy` to check actual identifiers
2. Verify element is on screen (not below fold)
3. Check for loading states blocking UI
4. Add wait before interaction:
   ```yaml
   - extendedWaitUntil:
       visible: "Element"
       timeout: 10000
   ```

### Keyboard Blocking Elements

**Symptoms:** `tapOn` fails after inputText

**Solution:**

```yaml
- inputText: "password"
- hideKeyboard
- tapOn:
    id: "submit_button"
```

### Element Below Fold

**Symptoms:** Element exists but can't be tapped

**Solution:**

```yaml
- scroll
- tapOn:
    id: "hidden_button"

# Or
- scrollUntilVisible:
    element:
      id: "hidden_button"
```

### Timing Issues

**Symptoms:** Intermittent failures

**Solutions:**

```yaml
# Wait for animations
- waitForAnimationToEnd

# Extended wait
- extendedWaitUntil:
    visible: "Element"
    timeout: 10000

# Retry flaky actions
- retry:
    maxRetries: 3
    commands:
      - tapOn: "Button"
```

### iOS Permission Dialog Not Dismissed

**Symptoms:** Dialog stays on screen

**Solutions:**

1. Ensure simulator language is **English**
2. Use `permissions:` in launchApp:
   ```yaml
   - launchApp:
       permissions:
         camera: allow
   ```

### Android Dialog Not Responding

**Symptoms:** Permission dialog not tapped

**Solution:**

```yaml
- tapOn: "While using the app"
# Try exact text from dialog
```

## Debugging Flow

```yaml
# Add screenshots at key points
- takeScreenshot: "step_1"
- tapOn: "Button"
- takeScreenshot: "step_2"
```

## Verbose Mode

Run with debug output:

```bash
maestro test --debug flow.yaml
```

## Check Device Connection

```bash
# Android
adb devices

# iOS
xcrun simctl list devices booted
```

## Re-install App

```bash
# Android
adb uninstall com.example.app
adb install app.apk

# iOS
xcrun simctl uninstall booted com.example.app
xcrun simctl install booted App.app
```
