---
name: assertions
description: assertVisible, assertNotVisible, assertTrue, and AI assertions
metadata:
  tags: assertions, assert, visible, not-visible, ai
---

## assertVisible

Assert that an element is visible on screen.

```yaml
# By text
- assertVisible: "Welcome"

# By ID
- assertVisible:
    id: "dashboard_header"

# With timeout (milliseconds)
- assertVisible:
    text: "Loading complete"
    timeout: 10000
```

## assertNotVisible

Assert that an element is NOT visible.

```yaml
- assertNotVisible: "Error message"

- assertNotVisible:
    id: "loading_spinner"
```

## assertTrue

Assert a JavaScript expression evaluates to true.

```yaml
# Simple condition
- assertTrue: ${count > 0}

# With stored output
- copyTextFrom:
    id: "price_label"
- assertTrue: ${output.price.includes("$")}
```

## AI-Powered Assertions

### assertWithAI

Use natural language to describe expected state:

```yaml
- assertWithAI: "The shopping cart shows 3 items"
- assertWithAI: "User profile picture is visible in the header"
- assertWithAI: "The form has been submitted successfully"
```

### assertNoDefectsWithAI

Check for visual defects and UI issues:

```yaml
- assertNoDefectsWithAI
```

Detects:

- Overlapping elements
- Truncated text
- Broken layouts
- Missing images

## Assertion Patterns

### Wait Then Assert

```yaml
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 15000
- assertVisible: "Welcome back"
```

### Multi-Element Assertions

```yaml
- assertVisible: "Username"
- assertVisible: "Password"
- assertVisible: "Login"
- assertNotVisible: "Error"
```

### Conditional Assertion

```yaml
- runFlow:
    when:
      visible: "Cookie Banner"
    commands:
      - tapOn: "Accept"
- assertNotVisible: "Cookie Banner"
```
