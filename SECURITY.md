# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security reports.** Use GitHub's private vulnerability reporting instead:

1. Go to the [Security tab](../../security) of this repo.
2. Click **Report a vulnerability**.
3. Fill in the form with a description, impact, and reproduction steps.

If GitHub private reporting is unavailable, email **ogunsakin191@gmail.com** with the same details. Please include:

- Affected package(s) and version(s). one of `create-atomic-react`, `@react-app-boilerplate/*`, or the template variants.
- Reproduction steps or a proof-of-concept.
- Impact (data exposure, RCE, DoS, supply-chain, etc.).

## Response

We aim to acknowledge within **3 business days** and provide a fix or mitigation timeline within **10 business days** for confirmed vulnerabilities. Coordinated disclosure timelines are negotiable for complex issues.

## Supported versions

Only the latest minor of each published package under `@react-app-boilerplate/*` and the CLI receives security fixes. Users on older versions should upgrade. Renovate can automate this.

| Package                                   | Supported |
| ----------------------------------------- | --------- |
| `create-atomic-react` (latest minor)      | ✅        |
| `@react-app-boilerplate/*` (latest minor) | ✅        |
| Anything older                            | ❌        |

## Scope

**In scope:** vulnerabilities in code we publish (the CLI and the shareable config packages).

**Out of scope:** vulnerabilities in transitive dependencies. Report those to the upstream project. Renovate + `renovate.json`'s `vulnerabilityAlerts` block will surface upstream advisories to consumers automatically.
