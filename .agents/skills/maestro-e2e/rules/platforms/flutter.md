---
name: flutter
description: Flutter integration using Semantics and identifier
metadata:
  tags: flutter, semantics, identifier, dart, widget
---

## Requirement

Flutter 3.19+ is required for `Semantics.identifier` support.

Check your version:

```bash
flutter --version
```

Upgrade if needed:

```bash
flutter upgrade
```

## Semantics Identifier (Recommended)

Use `Semantics` widget with `identifier` property:

```dart
Semantics(
  identifier: 'login_button',
  child: ElevatedButton(
    onPressed: () => login(),
    child: const Text('Login'),
  ),
)
```

In Maestro:

```yaml
- tapOn:
    id: "login_button"
```

## Semantics Label (Alternative)

For older Flutter versions, use `semanticsLabel`:

```dart
Text(
  'Welcome',
  semanticsLabel: 'welcome_text',
)

TextField(
  decoration: const InputDecoration(
    hintText: 'Email',
    semanticLabel: 'email_field',
  ),
)
```

## Why Not Flutter Keys?

Flutter `Key` is NOT accessible by Maestro. Keys exist only in the widget tree, not in the accessibility/semantics tree that Maestro inspects.

```dart
// ❌ NOT accessible by Maestro
ElevatedButton(
  key: const Key('login_button'),
  child: const Text('Login'),
)

// ✅ Accessible by Maestro
Semantics(
  identifier: 'login_button',
  child: ElevatedButton(
    child: const Text('Login'),
  ),
)
```

## Naming Convention

Use snake_case for identifiers:

```dart
// Pattern: {screen}_{element}_{type}
identifier: 'login_email_field'
identifier: 'login_password_field'
identifier: 'login_submit_button'
identifier: 'dashboard_profile_card'
```

## Common Widgets

### Buttons

```dart
Semantics(
  identifier: 'submit_button',
  child: ElevatedButton(
    onPressed: onSubmit,
    child: const Text('Submit'),
  ),
)
```

### Text Fields

```dart
Semantics(
  identifier: 'email_field',
  child: TextField(
    controller: emailController,
    decoration: const InputDecoration(
      labelText: 'Email',
    ),
  ),
)
```

### Cards / Containers

```dart
Semantics(
  identifier: 'user_profile_card',
  child: Card(
    child: ListTile(
      title: Text(user.name),
    ),
  ),
)
```

### Status Text

```dart
Semantics(
  identifier: 'permission_status',
  child: Text(
    permissionGranted ? 'Granted' : 'Denied',
  ),
)
```

## Full Example

```dart
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Column(
        children: [
          Semantics(
            identifier: 'login_email_field',
            child: TextField(
              decoration: const InputDecoration(labelText: 'Email'),
            ),
          ),
          Semantics(
            identifier: 'login_password_field',
            child: TextField(
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
          ),
          Semantics(
            identifier: 'login_submit_button',
            child: ElevatedButton(
              onPressed: () => login(),
              child: const Text('Login'),
            ),
          ),
        ],
      ),
    );
  }
}
```

## Maestro Test

```yaml
appId: com.example.myApp
---
- launchApp:
    clearState: true

- tapOn:
    id: "login_email_field"
- inputText: "test@example.com"

- tapOn:
    id: "login_password_field"
- inputText: "password123"

- hideKeyboard
- tapOn:
    id: "login_submit_button"

- assertVisible: "Dashboard"
```
