import { makeMutable, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { BAR_COLORS } from '../constants/theme';

/** مدت fade-in نوار و لغزیدن مهره‌ها هنگام اضافه شدن یک حرف. */
export const CHIP_FADE_IN_MS = 120;
export const CHIP_SPRING = { stiffness: 320, damping: 14 } as const;

/**
 * وضعیت نمایشیِ مهره‌های «کلمه‌ی در حال ساخت»، روی UI thread.
 *
 * هنگام لمس، خود worklet انتخاب (`pushChip`) این مقادیر را همان لحظه تغییر می‌دهد و مهره‌ها
 * با Skia از روی آن‌ها کشیده می‌شوند؛ پس ظاهر شدن مهره منتظر رفت‌وبرگشت به JS و رندر React نمی‌ماند.
 */
export interface WordBarFx {
  /** اندیس کارت‌های انتخاب‌شده، به ترتیب انتخاب. */
  picks: SharedValue<number[]>;
  /** مقیاس هر مهره (انیمیشن فنری ورود)، به ترتیب انتخاب. */
  scales: SharedValue<number>[];
  /** تعداد مهره‌ها برای چیدمان؛ کسری بودنش لغزیدن نرم مهره‌ها به سمت وسط را می‌دهد. */
  slide: SharedValue<number>;
  /** 0→1: نمایان بودن مهره‌ها. */
  visibility: SharedValue<number>;
  /** اندیس رنگ مهره‌ها (`CHIP_VERDICTS` در theme). */
  verdict: SharedValue<number>;
  /** رنگ کلمه‌ی پیوسته؛ با عوض شدن `verdict` روی UI thread نرم عوض می‌شود. */
  tint: SharedValue<string>;
}

export function createWordBarFx(slots: number): WordBarFx {
  return {
    picks: makeMutable<number[]>([]),
    scales: Array.from({ length: slots }, () => makeMutable(0)),
    slide: makeMutable(0),
    visibility: makeMutable(0),
    verdict: makeMutable(0),
    tint: makeMutable<string>(BAR_COLORS.building),
  };
}

/** Worklet: مهره‌ی کارت `index` را اضافه می‌کند؛ اگر `startsNew` باشد، کلمه‌ی قبلی را کنار می‌گذارد. */
export function pushChip(fx: WordBarFx, index: number, startsNew: boolean): void {
  'worklet';
  let next: number[];
  if (startsNew) {
    next = [index];
    for (let i = 0; i < fx.scales.length; i++) {
      fx.scales[i].value = 0;
    }
    fx.slide.value = 1;
    fx.verdict.value = 0;
    fx.tint.value = BAR_COLORS.building;
  } else {
    next = [...fx.picks.value, index];
    fx.slide.value = withTiming(next.length, { duration: CHIP_FADE_IN_MS });
  }
  fx.picks.value = next;
  const slot = next.length - 1;
  if (slot < fx.scales.length) {
    fx.scales[slot].value = withSpring(1, CHIP_SPRING);
  }
  fx.visibility.value = withTiming(1, { duration: CHIP_FADE_IN_MS });
}
