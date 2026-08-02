---
name: best-practices
description: Semantic identifiers, atomic tests, project structure
metadata:
  tags: best-practices, patterns, structure, naming
---

## Use Semantic Identifiers

Always add testable identifiers to UI elements:

### Flutter

```dart
Semantics(
  identifier: 'login_submit_button',
  child: ElevatedButton(...),
)
```

### React Native

```jsx
<TouchableOpacity testID="login_submit_button">
```

### Native

- iOS: `accessibilityIdentifier`
- Android: `android:contentDescription` or `resource-id`

## Naming Convention

Use snake*case with pattern: `{screen}*{element}\_{type}`

```
login_email_field
login_password_field
login_submit_button
dashboard_profile_card
settings_logout_button
```

## Atomic Tests

Each test should be **independent** and **self-contained**:

```yaml
# ✅ Good - Independent test
appId: com.example.app
---
- launchApp:
    clearState: true  # Fresh start
- runFlow: subflows/login.yaml
- tapOn: "Settings"
- assertVisible: "Settings"

# ❌ Bad - Depends on previous test state
appId: com.example.app
---
- tapOn: "Settings"  # Assumes already logged in
```

## Use clearState

Always start with clean app state:

```yaml
- launchApp:
    clearState: true
```

## Project Structure

```
project/
├── e2e/
│   ├── flows/
│   │   ├── auth/
│   │   │   ├── login_success.yaml
│   │   │   ├── login_invalid.yaml
│   │   │   └── register.yaml
│   │   ├── checkout/
│   │   │   ├── add_to_cart.yaml
│   │   │   └── complete_purchase.yaml
│   │   └── profile/
│   │       └── update_profile.yaml
│   └── subflows/
│       ├── login.yaml
│       ├── navigate_to_cart.yaml
│       └── fill_address.yaml
└── .agent/
    └── workflows/
        ├── maestro-test.md
        └── maestro-run.md
```

## Subflows for Reusability

Extract common patterns:

```yaml
# subflows/login.yaml
---
- tapOn:
    id: "email_field"
- inputText: ${USERNAME}
- tapOn:
    id: "password_field"
- inputText: ${PASSWORD}
- hideKeyboard
- tapOn:
    id: "submit_button"
- assertVisible: "Dashboard"
```

Use in flows:

```yaml
- runFlow:
    file: subflows/login.yaml
    env:
      USERNAME: test@example.com
```

## Always Hide Keyboard

Before tapping elements that might be obscured:

```yaml
- inputText: "password"
- hideKeyboard
- tapOn:
    id: "submit"
```

## Take Screenshots at Key Points

```yaml
- takeScreenshot: "01_before_action"
- tapOn: "Submit"
- takeScreenshot: "02_after_action"
```

## Use extendedWaitUntil for Async

```yaml
- tapOn: "Load Data"
- extendedWaitUntil:
    visible: "Data Loaded"
    timeout: 15000
```

## Handle Platform Differences

```yaml
- runFlow:
    when:
      platform: Android
    commands:
      - tapOn: "Allow" # Android permission
```

## Environment Variables for Secrets

```yaml
# Never hardcode credentials
env:
  USERNAME: ${USERNAME}
  PASSWORD: ${PASSWORD}
---
- inputText: ${USERNAME}
```

Pass via CLI:

```bash
maestro test -e USERNAME=test -e PASSWORD=secret flow.yaml
```

## Document Test Purpose

Add comments at the top:

```yaml
# Test: Verify successful login with valid credentials
# Preconditions: None (uses clearState)
# Expected: User reaches Dashboard
appId: com.example.app
---
```
