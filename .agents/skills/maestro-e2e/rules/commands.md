---
name: commands
description: Complete reference of 40+ Maestro commands
metadata:
  tags: commands, api, reference, launchApp, tapOn
---

## App Lifecycle

| Command         | Description               | Example                             |
| --------------- | ------------------------- | ----------------------------------- |
| `launchApp`     | Launch app                | `- launchApp: { clearState: true }` |
| `stopApp`       | Stop app (keep in memory) | `- stopApp`                         |
| `killApp`       | Kill app completely       | `- killApp`                         |
| `clearState`    | Clear app data            | `- clearState`                      |
| `clearKeychain` | Clear iOS keychain        | `- clearKeychain`                   |

### launchApp Options

```yaml
- launchApp:
    clearState: true # Reset app data
    clearKeychain: true # iOS only
    permissions:
      camera: allow
      location: deny
    arguments: # Launch arguments
      env: staging
```

## Interactions

| Command        | Description          | Example                                  |
| -------------- | -------------------- | ---------------------------------------- |
| `tapOn`        | Tap element          | `- tapOn: "Button"`                      |
| `doubleTapOn`  | Double tap           | `- doubleTapOn: "Element"`               |
| `longPressOn`  | Long press           | `- longPressOn: "Element"`               |
| `inputText`    | Type text            | `- inputText: "Hello"`                   |
| `eraseText`    | Delete text          | `- eraseText: { charactersToErase: 10 }` |
| `pasteText`    | Paste from clipboard | `- pasteText`                            |
| `hideKeyboard` | Dismiss keyboard     | `- hideKeyboard`                         |

## Navigation

| Command              | Description                  | Example                                       |
| -------------------- | ---------------------------- | --------------------------------------------- |
| `scroll`             | Scroll down                  | `- scroll`                                    |
| `scrollUntilVisible` | Scroll until element visible | `- scrollUntilVisible: { element: "Footer" }` |
| `swipe`              | Swipe gesture                | `- swipe: { direction: LEFT }`                |
| `back`               | Android back button          | `- back`                                      |
| `openLink`           | Open deep link               | `- openLink: "myapp://home"`                  |

## Assertions

| Command            | Description                  | Example                       |
| ------------------ | ---------------------------- | ----------------------------- |
| `assertVisible`    | Assert element visible       | `- assertVisible: "Welcome"`  |
| `assertNotVisible` | Assert element NOT visible   | `- assertNotVisible: "Error"` |
| `assertTrue`       | Assert JavaScript expression | `- assertTrue: ${count > 0}`  |

## Screenshots & Recording

| Command          | Description           | Example                      |
| ---------------- | --------------------- | ---------------------------- |
| `takeScreenshot` | Capture screenshot    | `- takeScreenshot: "result"` |
| `startRecording` | Start video recording | `- startRecording: "flow"`   |
| `stopRecording`  | Stop video recording  | `- stopRecording`            |

## Device Control

| Command           | Description              | Example                                                |
| ----------------- | ------------------------ | ------------------------------------------------------ |
| `setLocation`     | Mock GPS location        | `- setLocation: { lat: 40.7, long: -74.0 }`            |
| `setAirplaneMode` | Toggle airplane mode     | `- setAirplaneMode: { enabled: true }`                 |
| `setOrientation`  | Set screen orientation   | `- setOrientation: { orientation: LANDSCAPE }`         |
| `setPermissions`  | Set permissions mid-flow | `- setPermissions: { permissions: { camera: allow } }` |

## Flow Control

| Command      | Description         | Example                                       |
| ------------ | ------------------- | --------------------------------------------- |
| `runFlow`    | Run subflow         | `- runFlow: { file: "login.yaml" }`           |
| `runScript`  | Run JavaScript file | `- runScript: { file: "script.js" }`          |
| `evalScript` | Inline JavaScript   | `- evalScript: ${output.value = 'test'}`      |
| `repeat`     | Repeat commands     | `- repeat: { times: 3, commands: [...] }`     |
| `retry`      | Retry on failure    | `- retry: { maxRetries: 3, commands: [...] }` |

## Waiting

| Command                 | Description         | Example                                                       |
| ----------------------- | ------------------- | ------------------------------------------------------------- |
| `extendedWaitUntil`     | Wait with timeout   | `- extendedWaitUntil: { visible: "Element", timeout: 10000 }` |
| `waitForAnimationToEnd` | Wait for animations | `- waitForAnimationToEnd`                                     |

## AI Commands

| Command                 | Description          | Example                                       |
| ----------------------- | -------------------- | --------------------------------------------- |
| `assertWithAI`          | AI-powered assertion | `- assertWithAI: "Shopping cart has 3 items"` |
| `assertNoDefectsWithAI` | Check for UI defects | `- assertNoDefectsWithAI`                     |
| `extractTextWithAI`     | Extract text with AI | `- extractTextWithAI: { query: "price" }`     |

## Media

| Command        | Description            | Example                             |
| -------------- | ---------------------- | ----------------------------------- |
| `addMedia`     | Add media to device    | `- addMedia: { path: "photo.jpg" }` |
| `setClipboard` | Set clipboard content  | `- setClipboard: "Copied text"`     |
| `copyTextFrom` | Copy text from element | `- copyTextFrom: { id: "label" }`   |
