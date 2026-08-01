---
name: nested-flows
description: Reusable subflows with runFlow command
metadata:
  tags: subflows, runFlow, reusable, modular
---

## What are Subflows?

Subflows are reusable test files that can be called from other flows. They help:

- Reduce code duplication
- Create modular test suites
- Share common steps (login, navigation)

## Basic Usage

### Create a Subflow

```yaml
# subflows/login.yaml
appId: com.example.myApp
env:
  USERNAME: ${USERNAME || 'default@example.com'}
  PASSWORD: ${PASSWORD || 'password123'}
---
- tapOn:
    id: "email_field"
- inputText: ${USERNAME}
- tapOn:
    id: "password_field"
- inputText: ${PASSWORD}
- hideKeyboard
- tapOn:
    id: "login_button"
- assertVisible: "Dashboard"
```

### Call the Subflow

```yaml
# main_test.yaml
appId: com.example.myApp
---
- launchApp:
    clearState: true

- runFlow:
    file: subflows/login.yaml
    env:
      USERNAME: myuser@example.com
      PASSWORD: mypassword

- tapOn: "Settings"
```

## Passing Parameters

Override subflow defaults:

```yaml
- runFlow:
    file: subflows/login.yaml
    env:
      USERNAME: admin@example.com
      PASSWORD: adminpass
```

## Conditional Subflows

Run only when condition is met:

```yaml
- runFlow:
    when:
      visible: "Login"
    file: subflows/login.yaml
```

## Inline Commands

Run commands inline (without separate file):

```yaml
- runFlow:
    when:
      visible: "Cookie Banner"
    commands:
      - tapOn: "Accept"
```

## Directory Structure

```
e2e/
├── flows/
│   ├── login_test.yaml
│   ├── checkout_test.yaml
│   └── profile_test.yaml
└── subflows/
    ├── login.yaml
    ├── navigate_to_cart.yaml
    └── fill_address.yaml
```

## Common Subflows

### Login

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
    id: "login_button"
```

### Navigation

```yaml
# subflows/navigate_to_settings.yaml
---
- tapOn:
    id: "menu_button"
- tapOn: "Settings"
- assertVisible: "Settings"
```

### Logout

```yaml
# subflows/logout.yaml
---
- tapOn:
    id: "menu_button"
- scroll
- tapOn: "Logout"
- assertVisible: "Login"
```

## Chaining Subflows

```yaml
appId: com.example.myApp
---
- launchApp:
    clearState: true

- runFlow:
    file: subflows/login.yaml

- runFlow:
    file: subflows/navigate_to_settings.yaml

- runFlow:
    file: subflows/change_password.yaml

- runFlow:
    file: subflows/logout.yaml
```

## Subflow Best Practices

1. **Single responsibility** - Each subflow does one thing
2. **Use parameters** - Make subflows configurable
3. **Include assertions** - Verify expected state
4. **Organize in folders** - Group by feature or type
5. **Document dependencies** - Note required parameters
