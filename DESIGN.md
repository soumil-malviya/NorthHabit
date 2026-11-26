# NorthHabit Design System

The interface is built from a small set of tokens defined in
[`src/index.css`](src/index.css). Change a token, not a component, and the whole
product moves with it.

## Principles

1. **Calm over stimulation.** No streaks-as-pressure, no confetti, no red badges.
2. **One accent.** Teal is a signal, not decoration — actions, focus rings, live state.
3. **Matte surfaces.** Depth comes from layered neutrals and hairlines, not heavy shadows.
4. **Motion explains.** Animation shows where something came from or went. It never entertains.
5. **Local-first.** Every surface must be usable offline before it is usable online.

## Colour

Two themes share one token contract. Dark is the default; `.light-theme` on the
root element switches to the cream palette.

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--bg-primary` | `#090a0b` | `#f3f0e9` | Page canvas |
| `--bg-secondary` | `#101113` | `#faf8f2` | Sections, sidebars |
| `--bg-tertiary` | `#17181b` | `#fffdf8` | Cards, popovers |
| `--surface-raised` | `#17181b` | `#fffdf8` | Elevated panels |
| `--surface-sunken` | `#070809` | `#ebe7dc` | Wells, tracks |
| `--accent-primary` | `#0f8aa3` | `#0f8aa3` | Actions, focus, live state |
| `--accent-primary-hover` | `#0b7285` | `#0b7285` | Hover |
| `--text-primary` | `#f3f0ea` | `#1f2528` | Headings, primary copy |
| `--text-secondary` | `#a7a29a` | `#5f6668` | Body copy |
| `--text-muted` | `#6f6a62` | `#92908a` | Labels, metadata |
| `--border-light` | `rgba(244,239,229,.085)` | `rgba(43,45,42,.10)` | Hairlines |

State colours are used sparingly and never as the only signal:
`--state-success #4f9d78`, `--state-warning #c98645`, `--state-danger #d45a5a`.

## Typography

| Role | Family | Usage |
| --- | --- | --- |
| Display and headings | **Sora** | Section titles, numerals, brand |
| Body and UI | **Inter** | Copy, labels, controls, tables |

Headings use tight negative tracking (−0.02em to −0.04em) at large sizes and
normal tracking at body sizes. Eyebrow labels are uppercase, 11–13px, and
letter-spaced 0.2em. Body copy stays between 16px and 18px with 1.6 line height.

## Shape and elevation

- Radii: 12px for controls, 16–20px for cards, 24px for hero panels, full for pills.
- Elevation is two shadows: a soft ambient drop plus a 1px inner highlight
  (`--shadow-resting`, `--shadow-lifted`). Nothing floats without a hairline.
- Glass surfaces use `--glass-background` with a 2–4px blur and a matching border.

## Motion

| Token | Curve | Use |
| --- | --- | --- |
| `--smooth-transition` | `cubic-bezier(.4,0,.2,1)` | Default for colour, opacity, transform |
| `--premium-spring` | `cubic-bezier(.22,1,.36,1)` | Page and panel entrances |
| `--bounce-cubic` | `cubic-bezier(.34,1.56,.64,1)` | Small confirmations only |

Durations: 120–180ms for feedback, 240–320ms for layout, 600ms or more only for
ambient background movement. Honour `prefers-reduced-motion`.

## Focus and accessibility

- `--focus-ring` is the only focus indicator; it must never be removed.
- Contrast targets: 4.5:1 for body text, 3:1 for large text and icons.
- Every interactive element is reachable by keyboard and has a visible label.

## Voice

Short sentences. Sentence case. No exclamation marks. Describe what the user
gets, not how the product feels about itself.
