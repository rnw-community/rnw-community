---
name: permissions
description: iOS vs Android permission configuration and dialog handling
metadata:
  tags: permissions, camera, location, dialogs, ios, android
---

## Permission Configuration at Launch

By default, all permissions are set to `allow`. Override with `launchApp`:

```yaml
- launchApp:
    clearState: true
    permissions:
      all: deny # Deny all first
      camera: allow # Then allow specific
      location: allow
      notifications: deny
```

## Setting Permissions Mid-Flow

Use `setPermissions` outside of launch (e.g., before deep links):

```yaml
- setPermissions:
    permissions:
      camera: allow
      microphone: allow
```

## Available Permissions

| Permission      | iOS | Android |
| --------------- | --- | ------- |
| `camera`        | ✅  | ✅      |
| `location`      | ✅  | ✅      |
| `microphone`    | ✅  | ✅      |
| `photos`        | ✅  | ❌      |
| `notifications` | ✅  | ✅      |
| `contacts`      | ✅  | ✅      |
| `calendar`      | ✅  | ✅      |
| `medialibrary`  | ✅  | ✅      |
| `bluetooth`     | ❌  | ✅      |
| `storage`       | ❌  | ✅      |
| `phone`         | ❌  | ✅      |
| `sms`           | ❌  | ✅      |

Use `all` to reference all app permissions.

## Permission Values

| Value   | iOS          | Android                 |
| ------- | ------------ | ----------------------- |
| `allow` | Granted      | Granted                 |
| `deny`  | Denied       | Prompt shown at runtime |
| `unset` | Prompt shown | Prompt shown            |

## iOS-Specific Values

### Location

```yaml
permissions:
  location: always   # Same as allow
  location: inuse    # Only while using app
  location: never    # Same as deny
```

### Photos

```yaml
permissions:
  photos: limited # Limited access
```

## Platform Differences

### iOS

- Permission dialogs are **auto-dismissed** by Maestro
- Only works on **English** language simulators
- Cannot manually tap dialog buttons
- Use `permissions:` in `launchApp` to pre-configure

### Android

- Can **interact** with permission dialogs via `tapOn`
- Dialog text varies by Android version:
  - `"Allow"` / `"Deny"`
  - `"While using the app"`
  - `"Only this time"`
  - `"Don't allow"`

### Android Dialog Example

```yaml
- launchApp:
    permissions:
      camera: deny # Start denied

- tapOn:
    id: "request_camera_button"

# Android only - tap system dialog
- tapOn: "While using the app"

- assertVisible: "Camera ready"
```

## Custom Android Permissions

Use full permission ID for non-standard permissions:

```yaml
permissions:
  android.permission.ADD_VOICEMAIL: allow
  my.custom.permission: allow
```
