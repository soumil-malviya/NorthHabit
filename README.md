<div align="center">

<img src="docs/banner.png" alt="NorthHabit — habits, focus and rhythm in one private workspace" width="100%" />

<br />

**A private workspace for habits, tasks, focus and time.**

Habit tracking, a Pomodoro focus forest, a calendar and daily notes — in one
offline-first app that stays out of the way.

[Live app](https://northhabit.pages.dev) · [Design system](DESIGN.md) · [Security](SECURITY.md)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](#tech-stack)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](#tech-stack)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](#tech-stack)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](#tech-stack)
[![PWA](https://img.shields.io/badge/PWA-installable-0f8aa3)](#progressive-web-app)

</div>

---

## Overview

NorthHabit is a single-page web app built around one idea: productivity should
feel calm, not demanding. Everything is local-first, so the app keeps working
without a connection and never asks for more than it needs.

- **Habits** — daily routines with streaks, categories and completion history.
- **Tasks** — a to-do list with dates, notes and a simple completion flow.
- **Focus** — a Pomodoro timer that grows a tree for every completed session.
- **Calendar** — a month view that shows where your attention actually went.
- **Soundscapes** — rain, forest, café and white noise, generated or streamed.

## Preview

<table>
  <tr>
    <td width="70%"><img src="docs/focus.jpg" alt="Focus timer with the focus forest" /></td>
    <td width="30%"><img src="docs/mobile.jpg" alt="Mobile layout showing focus progress" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Focus timer — every session adds a tree to the forest</sub></td>
    <td align="center"><sub>Mobile — progress at a glance</sub></td>
  </tr>
</table>

<img src="docs/features.jpg" alt="Feature overview: habit tracker, to-do list, calendar, focus timer, offline-first, no noise" width="100%" />

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 with CSS custom-property theming |
| Animation | Motion (Framer Motion) |
| Icons | Lucide |
| Auth & sync | Firebase Authentication + Firestore (optional) |
| Hosting | Cloudflare Pages |
| Offline | Service worker + local storage |

## Getting started

Requires **Node.js 20+** and npm.

```bash
git clone https://github.com/soumil-malviya/NorthHabit.git
cd NorthHabit
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

### Environment variables

Firebase is optional. Without credentials the app runs entirely on local
storage; add a `.env` file at the project root to enable sign-in and cloud sync.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Never commit `.env` files or keys. See [SECURITY.md](SECURITY.md).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check only (`tsc --noEmit`) |
| `npm run verify` | Type-check and build — the pre-push check |

## Project structure

```
src/
  components/     UI, grouped by feature (landing, focus, ambient, settings)
  pages/          Route-level views
  hooks/          State and browser-API hooks
  contexts/       Ambient, soundscape and auth providers
  lib/            Focus engine, soundscape engine, notifications, SEO
  constants/      Brand, defaults and storage keys
  services/       Firestore and local storage bridges
public/           Static assets, manifest, service worker, audio
docs/             Screenshots and documentation images
```

## Progressive web app

NorthHabit installs as a PWA and caches its shell for offline use. The manifest,
service worker and icons live in `public/`; the notification scheduler lives in
`src/lib/notifications/`.

## Roadmap

| Status | Item |
| --- | --- |
| Done | Local-first habits, tasks, calendar, focus timer |
| Done | PWA install and offline shell |
| Done | Ambient soundscapes |
| Next | Cloud sync across devices |
| Next | Browser extension for focus-mode site blocking |
| Later | Custom theme editor and richer analytics |

## Contributing

Issues and pull requests are welcome. Before opening a PR:

1. Run `npm run verify` — it must pass.
2. Keep the interface minimal and the bundle small.
3. Preserve TypeScript strictness; avoid `any`.
4. Match the existing design tokens in `src/index.css` rather than adding new colours.

## License

No open-source license has been granted yet. The code is published for viewing
and review; all rights are reserved by the author. A license may be added in a
future release.

## Author

**Soumil Malviya** — [github.com/soumil-malviya](https://github.com/soumil-malviya)
