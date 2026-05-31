import type { AmbientPalette, TimePeriod } from '../../types/ambient';
import type { ThemeMode } from '../../types';

type PaletteMap = Record<TimePeriod, AmbientPalette>;

const DARK: PaletteMap = {
  night: {
    base: '#090a0b',
    orbA: 'rgba(63, 58, 51, 0.24)',
    orbB: 'rgba(28, 60, 67, 0.18)',
    orbC: 'rgba(15, 138, 163, 0.08)',
    vignette: 'rgba(0, 0, 0, 0.32)',
  },
  dawn: {
    base: '#0d0d0c',
    orbA: 'rgba(151, 119, 78, 0.14)',
    orbB: 'rgba(55, 82, 86, 0.12)',
    orbC: 'rgba(112, 104, 91, 0.12)',
    vignette: 'rgba(0, 0, 0, 0.28)',
  },
  day: {
    base: '#0b0c0d',
    orbA: 'rgba(15, 138, 163, 0.1)',
    orbB: 'rgba(70, 77, 75, 0.14)',
    orbC: 'rgba(96, 83, 67, 0.1)',
    vignette: 'rgba(0, 0, 0, 0.24)',
  },
  dusk: {
    base: '#0d0b0a',
    orbA: 'rgba(155, 103, 73, 0.16)',
    orbB: 'rgba(41, 75, 79, 0.14)',
    orbC: 'rgba(88, 80, 96, 0.1)',
    vignette: 'rgba(0, 0, 0, 0.3)',
  },
};

const LIGHT: PaletteMap = {
  night: {
    base: '#efebe2',
    orbA: 'rgba(150, 139, 121, 0.16)',
    orbB: 'rgba(210, 203, 190, 0.2)',
    orbC: 'rgba(15, 138, 163, 0.06)',
    vignette: 'rgba(255, 250, 241, 0.18)',
  },
  dawn: {
    base: '#f3eee5',
    orbA: 'rgba(218, 171, 118, 0.22)',
    orbB: 'rgba(190, 203, 197, 0.18)',
    orbC: 'rgba(235, 229, 217, 0.32)',
    vignette: 'rgba(255, 250, 241, 0.14)',
  },
  day: {
    base: '#f3f0e9',
    orbA: 'rgba(200, 194, 181, 0.22)',
    orbB: 'rgba(224, 218, 205, 0.22)',
    orbC: 'rgba(15, 138, 163, 0.06)',
    vignette: 'rgba(255, 250, 241, 0.08)',
  },
  dusk: {
    base: '#f0e9df',
    orbA: 'rgba(207, 152, 111, 0.2)',
    orbB: 'rgba(186, 180, 171, 0.18)',
    orbC: 'rgba(210, 204, 194, 0.24)',
    vignette: 'rgba(255, 250, 241, 0.12)',
  },
};

export function getPalette(period: TimePeriod, theme: ThemeMode): AmbientPalette {
  return theme === 'dark' ? DARK[period] : LIGHT[period];
}

function parseRgba(color: string): [number, number, number, number] {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return [0, 0, 0, 1];
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] ?? 1)];
}

function lerpRgba(a: string, b: string, t: number): string {
  const [r1, g1, b1, al1] = parseRgba(a);
  const [r2, g2, b2, al2] = parseRgba(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  const al = al1 + (al2 - al1) * t;
  return `rgba(${r}, ${g}, ${bl}, ${al.toFixed(3)})`;
}

function lerpHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function blendPalettes(from: AmbientPalette, to: AmbientPalette, t: number): AmbientPalette {
  return {
    base: lerpHex(from.base, to.base, t),
    orbA: lerpRgba(from.orbA, to.orbA, t),
    orbB: lerpRgba(from.orbB, to.orbB, t),
    orbC: lerpRgba(from.orbC, to.orbC, t),
    vignette: lerpRgba(from.vignette, to.vignette, t),
  };
}
