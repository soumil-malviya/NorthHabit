# Security Policy

## Supported versions

Security fixes are applied to the latest deployment at
[northhabit.pages.dev](https://northhabit.pages.dev) and to `main`. Older
commits and unofficial forks are not supported.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

- Use [GitHub Security Advisories](https://github.com/soumil-malviya/NorthHabit/security/advisories/new)
  for anything sensitive.
- Open a regular issue for low-risk findings such as a missing header or a
  hardening suggestion.

Include what you can:

1. A description of the issue and its impact.
2. Steps to reproduce, or a minimal proof of concept.
3. The affected page, route or component.
4. Browser and OS versions, plus screenshots or logs if useful.

You can expect an acknowledgement within a few days. Please allow time for a fix
before publishing details.

## Scope

In scope: the web application, its PWA build, the service worker, and the
Firebase configuration shipped in this repository.

Out of scope: findings that require a compromised device or browser, social
engineering, denial of service through bulk traffic, and reports produced only
by an automated scanner with no demonstrated impact.

## How the app handles data

- Habits, tasks, notes and settings are stored locally in the browser first.
- Cloud sync uses Firebase Authentication and Firestore, and only when the
  deployment is configured with Firebase credentials.
- No analytics or advertising SDKs run on user content. Firebase Analytics is
  loaded in production builds only, and is not used to profile individual users.
- Nothing is sold or shared with third parties.

## Disclosure

Once a fix is released, the advisory is published with credit to the reporter
unless anonymity is requested.
