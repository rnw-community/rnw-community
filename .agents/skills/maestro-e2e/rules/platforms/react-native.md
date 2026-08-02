---
name: react-native
description: React Native with testID and accessibilityLabel
metadata:
  tags: react-native, testID, accessibilityLabel, expo
---

## Element Identification

React Native uses two main approaches for testability:

### testID (Recommended)

```jsx
<TouchableOpacity testID="login_button" onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>
```

In Maestro:

```yaml
- tapOn:
    id: "login_button"
```

### accessibilityLabel

```jsx
<Text accessibilityLabel="welcome_message">Welcome to the app</Text>
```

In Maestro:

```yaml
- assertVisible:
    id: "welcome_message"
```

## Common Components

### Text Input

```jsx
<TextInput
  testID="email_input"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
/>
```

### Buttons

```jsx
<Pressable testID="submit_button" onPress={onSubmit}>
  <Text>Submit</Text>
</Pressable>
```

### ScrollView

```jsx
<ScrollView testID="main_scroll">{/* content */}</ScrollView>
```

### FlatList Items

```jsx
<FlatList
  testID="items_list"
  data={items}
  renderItem={({ item, index }) => (
    <View testID={`item_${index}`}>
      <Text>{item.name}</Text>
    </View>
  )}
/>
```

## Naming Convention

Use snake_case with descriptive names:

```jsx
// Pattern: {screen}_{element}_{type}
testID = "login_email_input";
testID = "login_password_input";
testID = "login_submit_button";
testID = "home_profile_card";
testID = "settings_logout_button";
```

## Expo Projects

Expo projects work identically:

```jsx
import { Pressable, Text } from "react-native";

export default function App() {
  return (
    <Pressable testID="hello_button">
      <Text>Hello</Text>
    </Pressable>
  );
}
```

## Full Example

```jsx
// LoginScreen.js
import React, { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";

export const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        testID="login_email_input"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        testID="login_password_input"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Pressable
        testID="login_submit_button"
        onPress={() => onLogin(email, password)}
        style={styles.button}
      >
        <Text>Login</Text>
      </Pressable>
    </View>
  );
};
```

## Maestro Test

```yaml
appId: com.example.myreactnativeapp
---
- launchApp:
    clearState: true

- tapOn:
    id: "login_email_input"
- inputText: "test@example.com"

- tapOn:
    id: "login_password_input"
- inputText: "password123"

- hideKeyboard
- tapOn:
    id: "login_submit_button"

- assertVisible: "Dashboard"
```

## Troubleshooting

### testID Not Found

1. Check element is rendered on screen
2. Run `maestro hierarchy` to inspect visible elements
3. Ensure testID is on correct component (not wrapper)

### Platform-Specific testID

```jsx
<View
  testID={Platform.select({
    ios: 'profile_card_ios',
    android: 'profile_card_android',
  })}
>
```
