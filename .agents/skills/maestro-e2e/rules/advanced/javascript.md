---
name: javascript
description: evalScript, runScript, and GraalJS support
metadata:
  tags: javascript, evalScript, runScript, graaljs, http
---

## JavaScript in Maestro

Maestro supports JavaScript for custom logic, HTTP requests, and data manipulation.

## Inline Script (evalScript)

```yaml
- evalScript: ${output.value = 'Hello World'}
- inputText: ${output.value}
```

Multi-line:

```yaml
- evalScript: |
    const timestamp = new Date().getTime();
    output.uniqueId = 'user_' + timestamp;
- inputText: ${output.uniqueId}
```

## External Script (runScript)

```yaml
- runScript:
    file: scripts/generate_data.js
```

### Script File

```javascript
// scripts/generate_data.js
const randomEmail = "user_" + Math.floor(Math.random() * 10000) + "@test.com";
output.email = randomEmail;
output.timestamp = new Date().toISOString();
```

### Use Output

```yaml
- runScript:
    file: scripts/generate_data.js
- inputText: ${output.email}
```

## HTTP Requests

```javascript
// scripts/fetch_user.js
const response = http.get("https://api.example.com/user/1");
output.user = JSON.parse(response.body);
```

### POST Request

```javascript
const response = http.post("https://api.example.com/login", {
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@example.com",
    password: "secret",
  }),
});
output.token = JSON.parse(response.body).token;
```

## The `output` Object

Any property set on `output` is available in subsequent steps:

```yaml
- evalScript: ${output.name = 'John'}
- assertVisible: "Hello, ${output.name}"
```

## Variable Access

Access flow parameters in scripts:

```yaml
env:
  API_URL: https://api.example.com
---
- runScript:
    file: scripts/api_test.js
```

```javascript
// scripts/api_test.js
const apiUrl = API_URL; // From env
const response = http.get(apiUrl + "/health");
output.healthy = response.status === 200;
```

## Supported Features

| Feature               | Supported |
| --------------------- | --------- |
| String manipulation   | ✅        |
| Math operations       | ✅        |
| Date/Time             | ✅        |
| JSON parse/stringify  | ✅        |
| HTTP requests         | ✅        |
| Arrays/Objects        | ✅        |
| require/import        | ❌        |
| File system access    | ❌        |
| External npm packages | ❌        |

## Runtime Options

### Rhino (Default)

Standard JavaScript runtime.

### GraalJS

Enable for better performance and ES6+ features:

```bash
export MAESTRO_USE_GRAALJS=true
maestro test flow.yaml
```

## Common Patterns

### Generate Random Data

```javascript
output.randomNumber = Math.floor(Math.random() * 1000);
output.randomString = Math.random().toString(36).substring(7);
```

### API Validation

```javascript
const response = http.get("https://api.example.com/products");
const products = JSON.parse(response.body);
output.productCount = products.length;
output.hasProducts = products.length > 0;
```

### Date Manipulation

```javascript
const now = new Date();
output.today = now.toISOString().split("T")[0];
output.timestamp = now.getTime();
```
