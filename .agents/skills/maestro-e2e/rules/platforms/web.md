---
name: web
description: Desktop browser testing with Chromium
metadata:
  tags: web, browser, chromium, desktop, url
---

## Web Testing Overview

Maestro supports testing web applications in a desktop Chromium browser.

## Test Structure

Use `url` instead of `appId`:

```yaml
url: https://example.com
---
- launchApp
- tapOn: "Sign In"
- assertVisible: "Dashboard"
```

## Running Web Tests

```bash
maestro test web_flow.yaml
```

On first run, Chromium is automatically downloaded.

## Maestro Studio for Web

```bash
maestro -p web studio
```

## Element Selectors

### By Text

```yaml
- tapOn: "Login"
- assertVisible: "Welcome"
```

### By ID (data-testid)

```yaml
- tapOn:
    id: "login-button"
```

Add `data-testid` to HTML elements:

```html
<button data-testid="login-button">Login</button>
<input data-testid="email-input" type="email" />
```

### By Standard ID

```yaml
- tapOn:
    id: "submit"
```

```html
<button id="submit">Submit</button>
```

## Form Interactions

```yaml
url: https://example.com/login
---
- launchApp

- tapOn:
    id: "email-input"
- inputText: "user@example.com"

- tapOn:
    id: "password-input"
- inputText: "secret123"

- tapOn:
    id: "login-button"

- assertVisible: "Welcome back"
```

## Navigation

### Page Navigation

```yaml
- openLink: "https://example.com/dashboard"
```

### Back Button

```yaml
- back
```

## Screenshots

```yaml
- takeScreenshot: "homepage"
```

## Known Limitations

| Feature            | Status                |
| ------------------ | --------------------- |
| Different browsers | ❌ Chromium only      |
| Different locales  | ❌ en-US only         |
| Screen size config | ❌ Not configurable   |
| Flutter Web        | ⚠️ Requires Semantics |
| Mobile viewport    | ❌ Desktop only       |

## Flutter Web

Flutter Web requires Semantics for element identification:

```dart
Semantics(
  identifier: 'login_button',
  child: ElevatedButton(...),
)
```

See [Flutter rules](./flutter.md) for details.

## Full Example

```yaml
url: https://demo.example.com
env:
  EMAIL: test@example.com
  PASSWORD: demo123
---
- launchApp
- takeScreenshot: "landing_page"

# Navigate to login
- tapOn: "Sign In"

# Fill form
- tapOn:
    id: "email-field"
- inputText: ${EMAIL}

- tapOn:
    id: "password-field"
- inputText: ${PASSWORD}

# Submit
- tapOn:
    id: "submit-button"

# Verify success
- assertVisible: "Dashboard"
- takeScreenshot: "logged_in"
```
