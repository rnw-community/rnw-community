# Security Policy

## Supported versions

All packages in this monorepo are released together under a single fixed version line (see [RELEASE.md](RELEASE.md)).
Security fixes ship only as a new release on the current major line; older majors receive no backports.

| Version                                  | Supported |
| ---------------------------------------- | --------- |
| 2.x (latest `npm` dist-tag of a package) | Yes       |
| < 2.0                                    | No        |

Within 2.x, fixes land in the next patch or minor release. Upgrade to the latest published version of the affected
package before reporting, since the fix may already be released.

Every package declares `engines.node: ">=22.0.0"`. Node versions below 22 are not supported, and reports that only
reproduce on an unsupported Node version are out of scope.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Report it privately through GitHub Security Advisories:
[Report a vulnerability](https://github.com/rnw-community/rnw-community/security/advisories/new) (repository
**Security** tab → **Report a vulnerability**).

Include:

- the affected package name and version
- a description of the vulnerability and its impact
- a minimal reproduction or proof of concept
- the environment (Node.js version, React Native / NestJS version, platform) where relevant

## What to expect

- Acknowledgement of the report within 7 days.
- A fix, mitigation, or explanation of why the report is out of scope after triage.
- A published GitHub Security Advisory (with a CVE when applicable) once a fixed version is on npm, crediting the
  reporter unless they prefer to stay anonymous.

## Supply-chain integrity

Packages are published from the `master` branch by the [release workflow](.github/workflows/release.yml) only, with
npm provenance attestations. Verify an installed package with `npm audit signatures`.
