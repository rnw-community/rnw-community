---
name: screenshots
description: Screenshots, video recording, and visual evidence
metadata:
  tags: screenshot, recording, video, visual
---

## takeScreenshot

Capture current screen state:

```yaml
- takeScreenshot: "login_page"
```

Screenshots saved to test output directory.

### At Key Points

```yaml
- launchApp
- takeScreenshot: "01_home"

- tapOn: "Login"
- takeScreenshot: "02_login_form"

- inputText: "user@example.com"
- takeScreenshot: "03_email_entered"

- tapOn: "Submit"
- takeScreenshot: "04_result"
```

### With Variables

```yaml
- repeat:
    times: 3
    commands:
      - takeScreenshot: "slide_${maestro.repeating.index}"
      - swipe:
          direction: LEFT
```

## Video Recording

### Start/Stop Recording

```yaml
- startRecording: "login_flow"

- launchApp
- tapOn: "Login"
- inputText: ${USERNAME}
- tapOn: "Submit"

- stopRecording
```

Video saved as `login_flow.mp4`.

### Full Flow Recording

```yaml
- startRecording: "complete_test"

# All test steps...

- stopRecording
```

## Output Location

Screenshots and recordings are saved relative to test execution:

```
maestro_output/
├── screenshots/
│   ├── login_page.png
│   └── dashboard.png
└── recordings/
    └── login_flow.mp4
```

## CI Artifacts

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: maestro test e2e/

- name: Upload Screenshots
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: maestro-screenshots
    path: maestro_output/
```

## Best Practices

1. **Name meaningfully** - Use descriptive names like `checkout_complete`
2. **Number sequences** - Prefix with numbers for order: `01_home`, `02_login`
3. **Screenshot on failure** - Helps debug issues
4. **Record critical flows** - Video for complex interactions
5. **Include in PR** - Share visual evidence in reviews

## Debugging Pattern

```yaml
- tapOn: "Problem Button"
- takeScreenshot: "after_tap"
```

If test fails, screenshot shows actual UI state.

## Screenshot All Steps

```yaml
- takeScreenshot: "step_01_launch"
- launchApp

- takeScreenshot: "step_02_before_tap"
- tapOn: "Login"

- takeScreenshot: "step_03_after_tap"
- assertVisible: "Dashboard"

- takeScreenshot: "step_04_final"
```
