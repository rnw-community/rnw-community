---
name: repeat-retry
description: Repeat and retry patterns for flaky tests
metadata:
  tags: repeat, retry, loop, flaky
---

## repeat

Execute commands multiple times:

```yaml
- repeat:
    times: 3
    commands:
      - tapOn: "Next"
      - takeScreenshot: "slide_${maestro.repeating.index}"
```

### Access Index

Use `${maestro.repeating.index}` (0-based):

```yaml
- repeat:
    times: 5
    commands:
      - tapOn:
          id: "item_${maestro.repeating.index}"
```

### Until Visible

Repeat until element appears:

```yaml
- repeat:
    whileVisible: "Load More"
    commands:
      - tapOn: "Load More"
      - extendedWaitUntil:
          notVisible: "Loading..."
          timeout: 5000
```

### Until Not Visible

Repeat until element disappears:

```yaml
- repeat:
    whileNotVisible: "Empty State"
    commands:
      - tapOn:
          id: "delete_item"
      - waitForAnimationToEnd
```

## retry

Retry a block of commands on failure:

```yaml
- retry:
    maxRetries: 3
    commands:
      - tapOn: "Retry Connection"
      - extendedWaitUntil:
          visible: "Connected"
          timeout: 5000
```

### With Condition

```yaml
- retry:
    maxRetries: 5
    onlyIf:
      visible: "Error"
    commands:
      - tapOn: "Try Again"
```

## Common Patterns

### Pagination Loop

```yaml
- repeat:
    times: 10
    commands:
      - scrollUntilVisible:
          element: "End of list"
          timeout: 2000
          optional: true
```

### Carousel Swipe

```yaml
- repeat:
    times: 4
    commands:
      - swipe:
          direction: LEFT
      - takeScreenshot: "carousel_${maestro.repeating.index}"
```

### Clear Notifications

```yaml
- repeat:
    whileVisible: "Notification"
    commands:
      - swipe:
          direction: RIGHT
          element: "Notification"
```

### Retry Network Operation

```yaml
- retry:
    maxRetries: 3
    commands:
      - tapOn: "Fetch Data"
      - extendedWaitUntil:
          visible: "Data Loaded"
          timeout: 10000
```

### Delete All Items

```yaml
- repeat:
    whileVisible: "Delete"
    commands:
      - tapOn: "Delete"
      - tapOn: "Confirm"
      - waitForAnimationToEnd
```

## Combining repeat and retry

```yaml
- repeat:
    times: 5
    commands:
      - retry:
          maxRetries: 2
          commands:
            - tapOn:
                id: "item_${maestro.repeating.index}"
            - assertVisible: "Item Details"
      - back
```

## Best Practices

1. **Set reasonable limits** - Prevent infinite loops
2. **Add waits in loops** - Allow UI to update
3. **Use whileVisible** - For dynamic content
4. **Combine with retry** - For network stability
5. **Take screenshots** - Debug loop issues
