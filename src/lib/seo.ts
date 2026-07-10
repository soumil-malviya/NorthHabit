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
  'streak tracker',
  'NorthHabit',
];

export const DEFAULT_SEO: SeoMetadata = {
  title: SEO.title,
  description: SEO.description,
  keywords: DEFAULT_KEYWORDS,
  path: '/',
  image: SEO.ogImage,
  robots: 'index,follow,max-image-preview:large',
  type: 'website',
};

export const PAGE_SEO: Record<string, SeoMetadata> = {
  '/': DEFAULT_SEO,
  '/app': {
    title: `${BRAND.name} Dashboard — Habits, Streaks & Focus`,
    description:
      'A calm dashboard for daily routines, streaks, activity duration, focus sessions, and productivity analytics. Offline-first and private.',
    path: '/app',
    type: 'app',
  },
  '/app/todo': {
    title: `${BRAND.name} Tasks — Quick To-Do Planning`,
    description:
      'Capture, schedule, and complete tasks in a fast offline-first productivity workspace.',
    path: '/app/todo',
    type: 'app',
  },
  '/app/calendar': {
    title: `${BRAND.name} Calendar — Daily Routine Overview`,
    description:
      'View habits and tasks by date with a clean calendar built for steady planning.',
    path: '/app/calendar',
    type: 'app',
  },
  '/app/pomodoro': {
    title: `${BRAND.name} Pomodoro — Focus Forest Timer`,
    description:
      'Start focused work sessions, grow your focus forest, and track session history.',
    path: '/app/pomodoro',
    type: 'app',
  },
  '/app/reminders': {
    title: `${BRAND.name} Reminders — Gentle Habit Nudges`,
    description:
      'Set private local reminders for routines, streaks, and focus sessions.',
    path: '/app/reminders',
    type: 'app',
  },
  '/privacy': {
    title: `${BRAND.name} Privacy Policy — User-Owned Productivity Data`,
    description:
      'Read how NorthHabit handles account information, habits, todos, focus history, local storage, Firebase Authentication, Cloud Firestore, analytics, and data deletion requests.',
    keywords: [
      'NorthHabit privacy policy',
      'habit tracker privacy',
      'Firebase Authentication privacy',
      'productivity app data policy',
      'user data deletion',
    ],
    path: '/privacy',
    type: 'website',
  },
  '/terms': {
    title: `${BRAND.name} Terms of Service — Productivity App Terms`,
    description:
      'Review the terms for using NorthHabit, including user accounts, acceptable use, service availability, third-party services, privacy, and account responsibilities.',
    keywords: [
      'NorthHabit terms',
      'terms of service',
      'productivity app terms',
      'habit tracker terms',
      'acceptable use policy',
    ],
    path: '/terms',
    type: 'website',
  },
};

const JSON_LD_ID = 'northhabit-jsonld';

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

function upsertJsonLd(payload: Record<string, unknown>) {
  let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
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
  const description = metadata.description;

  document.title = title;
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[name="keywords"]', 'content', keywords);
  setMeta('meta[name="robots"]', 'content', metadata.robots ?? DEFAULT_SEO.robots ?? 'index,follow');
  setMeta('meta[name="author"]', 'content', BRAND.name);
  setMeta('meta[name="application-name"]', 'content', BRAND.name);
  setMeta('link[rel="canonical"]', 'href', canonical);

  setMeta('meta[property="og:site_name"]', 'content', BRAND.name);
  setMeta('meta[property="og:locale"]', 'content', 'en_US');
  setMeta('meta[property="og:type"]', 'content', 'website');
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', canonical);
  setMeta('meta[property="og:image"]', 'content', image);
  setMeta('meta[property="og:image:alt"]', 'content', `${BRAND.name} — habit tracker and focus workspace preview`);
  setMeta('meta[property="og:image:width"]', 'content', '1200');
  setMeta('meta[property="og:image:height"]', 'content', '630');

  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('meta[name="twitter:image"]', 'content', image);
  setMeta('meta[name="twitter:image:alt"]', 'content', `${BRAND.name} product preview`);

  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
    || BRAND.colors.primary;
  setMeta('meta[name="theme-color"]', 'content', themeColor);

  upsertJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${absoluteUrl('/')}#website`,
        url: absoluteUrl('/'),
        name: BRAND.name,
        description,
        inLanguage: 'en-US',
        publisher: { '@id': `${absoluteUrl('/')}#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${absoluteUrl('/')}#organization`,
        name: BRAND.name,
        url: absoluteUrl('/'),
        logo: absoluteUrl('/favicon.svg'),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${absoluteUrl('/app')}#app`,
        name: BRAND.name,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description,
        url: absoluteUrl('/app'),
        image,
        isAccessibleForFree: true,
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        isPartOf: { '@id': `${absoluteUrl('/')}#website` },
        inLanguage: 'en-US',
      },
    ],
  });
}
