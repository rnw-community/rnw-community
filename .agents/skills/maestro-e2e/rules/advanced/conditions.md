---
name: conditions
description: Conditional execution with when visible, platform
metadata:
  tags: conditions, when, visible, platform, conditional
---

## Basic Condition

Execute commands only when a condition is met:

```yaml
- runFlow:
    when:
      visible: "Cookie Banner"
    commands:
      - tapOn: "Accept"
```

## Condition Types

### Visible

Run when element is visible:

```yaml
- runFlow:
    when:
      visible: "Login"
    commands:
      - tapOn:
          id: "login_button"
```

### Not Visible

Run when element is NOT visible:

```yaml
- runFlow:
    when:
      notVisible: "Loading"
    commands:
      - assertVisible: "Dashboard"
```

### Platform

Run on specific platform:

```yaml
- runFlow:
    when:
      platform: Android
    commands:
      - tapOn: "Allow" # Android permission dialog
```

```yaml
- runFlow:
    when:
      platform: iOS
    commands:
      - assertVisible: "iOS Feature"
```

### JavaScript Expression

Run based on JavaScript evaluation:

```yaml
- runFlow:
    when:
      true: ${count > 5}
    commands:
      - tapOn: "Load More"
```

## Combining Conditions

Use `and` for multiple conditions:

```yaml
- runFlow:
    when:
      visible: "Premium"
      platform: iOS
    commands:
      - tapOn: "Subscribe"
```

## Subflow with Condition

```yaml
- runFlow:
    when:
      visible: "Login"
    file: login_flow.yaml
    env:
      USERNAME: test@example.com
```

## Common Patterns

### Skip Onboarding

```yaml
- runFlow:
    when:
      visible: "Skip"
    commands:
      - tapOn: "Skip"
```

### Handle Cookie Banner

```yaml
- runFlow:
    when:
      visible: "Accept Cookies"
    commands:
      - tapOn: "Accept All"
```

### Platform Permission Dialogs

```yaml
# iOS auto-dismisses, Android needs tap
- runFlow:
    when:
      platform: Android
      visible: "Allow"
    commands:
      - tapOn: "While using the app"
```

### Feature Flags

```yaml
- runFlow:
    when:
      visible: "New Feature"
    commands:
      - tapOn: "Try It"
      - assertVisible: "Feature Enabled"
```

### Error Recovery

```yaml
- runFlow:
    when:
      visible: "Error occurred"
    commands:
      - tapOn: "Retry"
```

## Negating Conditions

```yaml
- runFlow:
    when:
      notVisible: "Premium Badge"
    commands:
      - tapOn: "Upgrade"
```
