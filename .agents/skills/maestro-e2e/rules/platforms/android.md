---
name: android
description: Android-specific features, ADB, permission dialogs, emulators
metadata:
  tags: android, adb, emulator, dialogs, permissions
---

## What is ADB?

ADB (Android Debug Bridge) is a command-line tool that enables communication between your computer and Android devices/emulators.

Maestro uses ADB internally to:

- Interact with system dialogs (permissions, alerts)
- Install/launch applications
- Simulate input events (taps, swipes, text)
- Inspect UI hierarchy

## Bundle ID Format

Android uses lowercase with underscores:

```yaml
appId: com.example.my_app
```

Find your app's package name:

```bash
adb shell pm list packages | grep yourapp
```

## Permission Dialogs

Maestro can **tap** Android permission dialogs:

```yaml
- launchApp:
    permissions:
      camera: deny # Start denied to trigger dialog

- tapOn:
    id: "request_permission_button"

# Tap the system dialog
- tapOn: "While using the app"
```

### Common Dialog Texts

| Android Version | Allow Options                                          |
| --------------- | ------------------------------------------------------ |
| Android 10      | "Allow", "Deny"                                        |
| Android 11+     | "While using the app", "Only this time", "Don't allow" |

## Emulator Setup

Start emulator via command line:

```bash
emulator -avd Pixel_4_API_31
```

List available devices:

```bash
adb devices
```

## UI Hierarchy Inspection

```bash
maestro hierarchy
```

Returns XML tree of all visible elements with their properties, useful for finding correct selectors.

## Android-Specific Commands

### Back Button

```yaml
- back
```

### Airplane Mode

```yaml
- setAirplaneMode:
    enabled: true
```

### Location Mocking

```yaml
- setLocation:
    latitude: 37.7749
    longitude: -122.4194
```

## Troubleshooting

### App Not Found

```bash
# Check if app is installed
adb shell pm list packages | grep com.example

# Reinstall APK
adb install -r app.apk
```

### Permission Dialog Not Appearing

Ensure app is started with `clearState: true` to reset permissions:

```yaml
- launchApp:
    clearState: true
```
