---
name: selectors
description: Element targeting with id, text, index, and matchers
metadata:
  tags: selectors, id, text, index, matchers
---

## Basic Selectors

### By Text (Default)

```yaml
- tapOn: "Login"
- assertVisible: "Welcome to Dashboard"
```

### By ID (Recommended)

```yaml
- tapOn:
    id: "login_button"

- assertVisible:
    id: "dashboard_header"
```

### By Index

When multiple elements match:

```yaml
- tapOn:
    text: "Item"
    index: 0 # First match (0-indexed)
```

## Combined Selectors

Combine multiple matchers (AND logic):

```yaml
- tapOn:
    id: "button"
    text: "Submit"
    enabled: true
```

## Selector Properties

| Property       | Description                             | Example               |
| -------------- | --------------------------------------- | --------------------- |
| `id`           | Accessibility ID / Semantics identifier | `id: "login_btn"`     |
| `text`         | Exact text match                        | `text: "Login"`       |
| `textContains` | Partial text match                      | `textContains: "Log"` |
| `index`        | Element index (0-based)                 | `index: 2`            |
| `enabled`      | Element enabled state                   | `enabled: true`       |
| `selected`     | Element selected state                  | `selected: true`      |
| `checked`      | Checkbox/toggle state                   | `checked: true`       |
| `focused`      | Element focus state                     | `focused: true`       |

## Hierarchy Selectors

Select relative to another element:

```yaml
# Child of element
- tapOn:
    below: "Username"
    id: "input_field"

# Element above another
- tapOn:
    above: "Submit"
    text: "Terms"

# Left/right of element
- tapOn:
    leftOf: "Cancel"
    text: "OK"
```

## Optional Selector

Don't fail if not found:

```yaml
- tapOn:
    optional: true
    text: "Skip"
```

## Point Selector

Tap exact coordinates:

```yaml
- tapOn:
    point: "50%,50%" # Center of screen
```

## Platform-Specific IDs

| Platform       | ID Source                                  |
| -------------- | ------------------------------------------ |
| Flutter        | `Semantics.identifier` or `semanticsLabel` |
| React Native   | `testID` or `accessibilityLabel`           |
| iOS Native     | `accessibilityIdentifier`                  |
| Android Native | `resource-id` or `content-desc`            |
| Web            | `data-testid` or `id` attribute            |
