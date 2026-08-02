---
name: ios
description: iOS-specific features, auto-dismiss dialogs, simulators, limitations
metadata:
  tags: ios, simulator, dialogs, permissions, auto-dismiss
---

## Bundle ID Format

iOS uses camelCase:

```yaml
appId: com.example.myApp
```

Find your app's bundle ID in Xcode project settings or:

```bash
xcrun simctl listapps booted | grep CFBundleIdentifier
```

## Permission Dialogs - Auto Dismiss

Maestro **automatically dismisses** permission dialogs on iOS by selecting "Allow".

**Important Limitations:**

- Only works on **English** language simulators
- Cannot manually tap dialog buttons
- Cannot select "Don't Allow" or custom options

### Example

```yaml
- launchApp:
    permissions:
      camera: deny # Will prompt and auto-allow

- tapOn:
    id: "open_camera_button"

# Dialog auto-dismissed, no tapOn needed
- assertVisible: "Camera Ready"
```

## Simulator Setup

List available simulators:

```bash
xcrun simctl list devices
```

Boot a simulator:

```bash
xcrun simctl boot "iPhone 15 Pro"
```

Open Simulator app:

```bash
open -a Simulator
```

## Language Requirement

For auto-dismiss to work, set simulator to English:

1. Settings → General → Language & Region
2. Select English
3. Restart simulator

Or via command line:

```bash
xcrun simctl shutdown all
defaults write com.apple.iphonesimulator AppleLocale "en_US"
xcrun simctl boot "iPhone 15 Pro"
```

## Push Notifications Behavior

`notifications: allow` on iOS:

- Does NOT grant permission automatically
- Shows OS prompt
- Maestro auto-dismisses with "Allow"

On Android, `notifications: allow` grants immediately.

## iOS-Specific Permissions

### Location Options

```yaml
permissions:
  location: always   # Always allow
  location: inuse    # Only while using
  location: never    # Deny
```

### Photos Options

```yaml
permissions:
  photos: allow     # Full access
  photos: limited   # Limited access
```

## Keychain

Clear iOS keychain (stored credentials):

```yaml
- launchApp:
    clearKeychain: true
```

Or as separate command:

```yaml
- clearKeychain
```

## Known Limitations

| Feature                    | Status           |
| -------------------------- | ---------------- |
| Permission dialog text tap | ❌ Not supported |
| Physical device testing    | ❌ Not supported |
| Non-English dialogs        | ❌ Not supported |
| Face ID / Touch ID         | ❌ Not supported |
| Apple Pay sheets           | ❌ Not supported |

## Workaround for Non-English

If testing in non-English, pre-grant permissions:

```yaml
- launchApp:
    permissions:
      camera: allow
      location: allow
      notifications: allow
```

This bypasses dialogs entirely.
