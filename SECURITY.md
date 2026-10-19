# Security Policy

## Supported versions

Only the latest published 2.x version of each package receives security fixes; older majors get no backports.
Upgrade to the latest version before reporting, since the fix may already be released. Node.js versions below 22 are
not supported.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.** Report it privately through
[GitHub Security Advisories](https://github.com/rnw-community/rnw-community/security/advisories/new) with the affected
package and version, the impact, and a minimal reproduction.

Expect an acknowledgement within 7 days. Once a fixed version is on npm, a GitHub Security Advisory (with a CVE when
applicable) is published, crediting the reporter unless they prefer to stay anonymous.

Packages are published only from `master` by the [release workflow](.github/workflows/release.yml), with npm
provenance attestations; verify an install with `npm audit signatures`.
