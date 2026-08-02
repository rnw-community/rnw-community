---
name: waiting
description: extendedWaitUntil, waitForAnimationToEnd
metadata:
  tags: wait, timeout, animation, loading
---

## extendedWaitUntil

Wait for an element with custom timeout (default is ~5 seconds):

```yaml
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 15000 # 15 seconds
```

### Wait for Not Visible

```yaml
- extendedWaitUntil:
    notVisible: "Loading..."
    timeout: 10000
```

### Optional Wait

Don't fail if timeout expires:

```yaml
- extendedWaitUntil:
    visible: "Optional Element"
    timeout: 5000
    optional: true
```

## waitForAnimationToEnd

Wait for all UI animations to complete:

```yaml
- tapOn: "Animate"
- waitForAnimationToEnd
- assertVisible: "Animation Complete"
```

Useful after:

- Page transitions
- Modal open/close
- Loading spinners
- Content refresh

## Common Patterns

### Wait for Loading

```yaml
- tapOn: "Load Data"
- extendedWaitUntil:
    visible: "Loading..."
    timeout: 3000
    optional: true
- extendedWaitUntil:
    notVisible: "Loading..."
    timeout: 30000
- assertVisible: "Data loaded"
```

### Wait and Assert

```yaml
- tapOn: "Submit"
- extendedWaitUntil:
    visible: "Success"
    timeout: 10000
- assertVisible: "Success"
```

### Slow Network Handling

```yaml
- launchApp
- extendedWaitUntil:
    visible: "Home"
    timeout: 30000 # Long timeout for slow networks
```

### Wait for Element After Navigation

```yaml
- tapOn: "Next Page"
- waitForAnimationToEnd
- extendedWaitUntil:
    visible: "Page Title"
    timeout: 5000
- assertVisible: "Page Title"
```

## Best Practices

1. **Use reasonable timeouts** - Too short = flaky tests, too long = slow tests
2. **Combine with assertions** - Wait then verify
3. **Handle loading states** - Wait for loading to appear AND disappear
4. **Use waitForAnimationToEnd** - After transitions before interacting

## Timeout Guidelines

| Scenario        | Recommended Timeout |
| --------------- | ------------------- |
| Page navigation | 5000-10000ms        |
| API response    | 10000-15000ms       |
| File upload     | 30000-60000ms       |
| Login/Auth      | 10000-15000ms       |
| App launch      | 15000-30000ms       |
