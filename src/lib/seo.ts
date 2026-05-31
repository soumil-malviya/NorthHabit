import { BRAND, SEO } from '../constants/brand';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  robots?: string;
  type?: 'website' | 'app';
}

export const DEFAULT_KEYWORDS = [
  'habit tracker',
  'productivity app',
  'pomodoro timer',
  'routine planner',
  'focus timer',
  'offline productivity',
  'NorthHabit',
];

export const DEFAULT_SEO: SeoMetadata = {
  title: SEO.title,
  description: SEO.description,
  keywords: DEFAULT_KEYWORDS,
  path: '/',
  image: SEO.ogImage,
  robots: 'index,follow',
  type: 'website',
};

export const PAGE_SEO: Record<string, SeoMetadata> = {
  '/': DEFAULT_SEO,
  '/app': {
    title: `${BRAND.name} Dashboard — Habits, Streaks & Focus`,
    description: 'A calm dashboard for daily routines, streaks, activity, focus, and progress analytics.',
    path: '/app',
    type: 'app',
  },
  '/app/todo': {
    title: `${BRAND.name} Tasks — Quick To-Do Planning`,
    description: 'Capture, schedule, and complete tasks in a fast offline-first productivity workspace.',
    path: '/app/todo',
    type: 'app',
  },
  '/app/calendar': {
    title: `${BRAND.name} Calendar — Daily Routine Overview`,
    description: 'View habits and tasks by date with a clean calendar built for steady planning.',
    path: '/app/calendar',
    type: 'app',
  },
  '/app/pomodoro': {
    title: `${BRAND.name} Pomodoro — Focus Forest Timer`,
    description: 'Start focused work sessions, grow your focus forest, and keep a mindful rhythm.',
    path: '/app/pomodoro',
    type: 'app',
  },
  '/app/reminders': {
    title: `${BRAND.name} Reminders — Gentle Habit Nudges`,
    description: 'Set private local reminders for routines, streaks, and focus sessions.',
    path: '/app/reminders',
    type: 'app',
  },
};

function absoluteUrl(path = '/') {
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL || SEO.siteUrl;
  const origin = String(configured).replace(/\/$/, '');
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attr, value);
    return;
  }

  const next =
    attr === 'href' ? document.createElement('link') : document.createElement('meta');
  const match = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
  if (match) next.setAttribute(match[1], match[2]);
  next.setAttribute(attr, value);
  document.head.appendChild(next);
}

export function resolveSeoMetadata(pathname: string, overrides?: Partial<SeoMetadata>): SeoMetadata {
  const page = PAGE_SEO[pathname] ?? DEFAULT_SEO;
  return {
    ...DEFAULT_SEO,
    ...page,
    ...overrides,
    keywords: overrides?.keywords ?? page.keywords ?? DEFAULT_SEO.keywords,
    image: overrides?.image ?? page.image ?? DEFAULT_SEO.image,
    path: overrides?.path ?? page.path ?? pathname,
  };
}

export function applySeoMetadata(metadata: SeoMetadata) {
  const title = metadata.title.includes(BRAND.name)
    ? metadata.title
    : `${metadata.title} — ${BRAND.name}`;
  const canonical = absoluteUrl(metadata.path);
  const image = absoluteUrl(metadata.image ?? SEO.ogImage);
  const keywords = (metadata.keywords ?? DEFAULT_KEYWORDS).join(', ');

  document.title = title;
  setMeta('meta[name="description"]', 'content', metadata.description);
  setMeta('meta[name="keywords"]', 'content', keywords);
  setMeta('meta[name="robots"]', 'content', metadata.robots ?? DEFAULT_SEO.robots ?? 'index,follow');
  setMeta('link[rel="canonical"]', 'href', canonical);
  setMeta('meta[property="og:site_name"]', 'content', BRAND.name);
  setMeta('meta[property="og:type"]', 'content', metadata.type === 'app' ? 'website' : 'website');
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', metadata.description);
  setMeta('meta[property="og:url"]', 'content', canonical);
  setMeta('meta[property="og:image"]', 'content', image);
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', metadata.description);
  setMeta('meta[name="twitter:image"]', 'content', image);
}
