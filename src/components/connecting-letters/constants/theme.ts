import type { Verdict } from '../types';

/**
 * فونت همه‌ی حروفی که با Skia کشیده می‌شوند (کارت‌ها و خانه‌های کلمات).
 * Skia فونت‌های ثبت‌شده در React Native را نمی‌بیند و خودش فایل را بارگذاری می‌کند:
 * این مسیر را به همان فایل ttf‌ای اشاره دهید که اپ برای «YekanBakh-ExtraBlack» استفاده می‌کند.
 */
export const LETTER_FONT = require('../../../assets/fonts/YekanBakhFaNum-ExtraBlack.ttf');

/** اندازه‌ی حرف نسبت به خانه‌ای که در آن قرار می‌گیرد. */
export const TILE_FONT_RATIO = 0.6;
export const SLOT_FONT_RATIO = 0.66;

export const BOARD_COLORS = {
  backgroundTop: '#2c2266',
  backgroundBottom: '#120e33',
  glow: 'rgba(132, 104, 255, 0.30)',
  glowEdge: 'rgba(132, 104, 255, 0)',
  innerLine: 'rgba(255, 255, 255, 0.09)',
  rim: ['#fff1b8', '#f2c14e', '#b9821f', '#f2c14e'],
  vignette: 'rgba(5, 3, 20, 0.45)',
  dots: 'rgba(190, 175, 255, 0.10)',
} as const;

export interface TilePalette {
  face: readonly [string, string];
  edge: string;
  gloss: string;
  rim: string;
  letter: string;
  letterShade: string;
  shadow: string | null;
}

/** کارتی که روی صفحه شناور است. */
export const TILE_IDLE: TilePalette = {
  face: ['#fffaf0', '#ffd98a'],
  edge: '#c47a1c',
  gloss: 'rgba(255, 255, 255, 0.7)',
  rim: 'rgba(255, 255, 255, 0.47)',
  letter: '#4a230b',
  letterShade: 'rgba(255, 255, 255, 0.75)',
  shadow: 'rgba(0, 0, 0, 0.45)',
};

/** کارتی که در کلمه‌ی فعلی استفاده شده: کوچک، با رنگ سرد و در حال عبور از زیر بقیه. */
export const TILE_PICKED: TilePalette = {
  face: ['#b9a8ff', '#7558e8'],
  edge: '#3f2b9e',
  gloss: 'rgba(255, 255, 255, 0.45)',
  rim: 'rgba(255, 255, 255, 0.28)',
  letter: '#ffffff',
  letterShade: 'rgba(30, 10, 90, 0.6)',
  shadow: null,
};

export const RIPPLE_COLOR = '#ffe27a';

export const SLOT_COLORS = {
  panel: 'rgba(10, 8, 34, 0.42)',
  panelLine: 'rgba(255, 226, 140, 0.16)',
  empty: 'rgba(14, 11, 46, 0.72)',
  emptyLine: 'rgba(255, 216, 120, 0.42)',
  emptyLineMain: 'rgba(255, 216, 120, 0.85)',
  word: ['#5ee7f7', '#1592b8'] as const,
  main: ['#ffe082', '#f08a12'] as const,
  gloss: 'rgba(255, 255, 255, 0.45)',
  letter: '#ffffff',
  letterOutline: 'rgba(40, 14, 0, 0.85)',
  hint: '#ffd76a',
} as const;

export const BAR_COLORS: Record<Verdict | 'building', string> = {
  building: '#6a4bdc',
  success: '#22b45a',
  error: '#e0393e',
  duplicate: '#1d9be0',
};

/**
 * رنگ مهره‌های «کلمه‌ی فعلی» به ترتیب `CHIP_VERDICTS`؛ همان خانواده‌ی رنگیِ `BAR_COLORS` که با
 * کلمه‌ی پیوسته‌ی زیرشان هماهنگ است. اندیس این آرایه در `WordBarFx.verdict` نگه داشته می‌شود.
 */
export const CHIP_VERDICTS = ['building', 'success', 'error', 'duplicate'] as const;

const chipPalette = (top: string, bottom: string, edge: string, shade: string): TilePalette => ({
  face: [top, bottom],
  edge,
  gloss: 'rgba(255, 255, 255, 0.45)',
  rim: 'rgba(255, 255, 255, 0.4)',
  letter: '#ffffff',
  letterShade: shade,
  shadow: 'rgba(0, 0, 0, 0.35)',
});

export const CHIP_PALETTES: TilePalette[] = [
  chipPalette('#9a82ff', '#6a4bdc', '#3f2b9e', 'rgba(30, 10, 90, 0.6)'),
  chipPalette('#5be08a', '#22b45a', '#126b36', 'rgba(0, 50, 20, 0.55)'),
  chipPalette('#ff7a7e', '#e0393e', '#8f1a1f', 'rgba(80, 0, 5, 0.55)'),
  chipPalette('#6cc8ff', '#1d9be0', '#0e5d93', 'rgba(0, 40, 80, 0.55)'),
];

export const TIMER_COLORS = {
  track: 'rgba(10, 8, 30, 0.7)',
  trackLine: 'rgba(255, 210, 110, 0.55)',
  low: '#ff4d4f',
  mid: '#ffb020',
  high: '#3ddc84',
  gloss: 'rgba(255, 255, 255, 0.35)',
} as const;
