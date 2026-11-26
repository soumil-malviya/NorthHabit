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

## Author

**Soumil Malviya** — [github.com/soumil-malviya](https://github.com/soumil-malviya)
