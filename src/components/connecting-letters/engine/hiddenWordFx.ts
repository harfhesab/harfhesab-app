import { createRef, type RefObject } from 'react';
import type { View } from 'react-native';
import { Easing, makeMutable, withTiming, type SharedValue } from 'react-native-reanimated';

/** مدت کل افکت (ms): پرواز کلمه به سمت دکمه، رسیدن و پخش شدن نور. */
export const HIDDEN_FX_MS = 2500;
/** لحظه‌ی رسیدن کلمه به دکمه، به صورت کسری از کل مدت؛ دکمه همین‌جا ضربه می‌خورد. */
export const HIDDEN_FX_IMPACT = 0.68;
/** تعداد کلمه‌ی هم‌زمان؛ اگر کلمه‌ی بعدی وسط افکت قبلی پیدا شود، افکت قبلی نمی‌پرد. */
const LANES = 2;

export interface HiddenWordLane {
  /** 0→1؛ مقدار 1 یعنی بیکار. */
  progress: SharedValue<number>;
  /** کلمه‌ای که پرواز می‌کند. */
  word: SharedValue<string>;
  /** برای پراکندگی یکتای جرقه‌ها در هر بار. */
  seed: SharedValue<number>;
}

/**
 * وضعیت افکت «کلمه‌ی پنهان به دکمه می‌افتد»، روی UI thread.
 *
 * منطق بازی فقط `triggerHiddenWord` را صدا می‌زند و باقی (پرواز، نور، ضربه‌ی دکمه) خود روی UI thread
 * از روی `progress` کشیده می‌شود. مختصات‌ها نسبت به ناحیه‌ی افکت (بالای صفحه‌ی بازی) هستند.
 */
export interface HiddenWordFx {
  lanes: HiddenWordLane[];
  /** مرکز دکمه‌ی «کلمات پنهان». */
  buttonX: SharedValue<number>;
  buttonY: SharedValue<number>;
  /** بالای نوار «کلمه‌ی فعلی»؛ جای شروع پرواز از روی آن حساب می‌شود. */
  currentWordY: SharedValue<number>;
  /** دکمه این را به view خودش وصل می‌کند تا افکت جایش را اندازه بگیرد. */
  buttonRef: RefObject<View | null>;
  /** افکت اینجا تابع اندازه‌گیری مختصات را ثبت می‌کند. */
  measure: RefObject<(() => void) | null>;
  counter: RefObject<number>;
}

export function createHiddenWordFx(): HiddenWordFx {
  return {
    lanes: Array.from({ length: LANES }, () => ({
      progress: makeMutable(1),
      word: makeMutable(''),
      seed: makeMutable(0),
    })),
    buttonX: makeMutable(0),
    buttonY: makeMutable(0),
    currentWordY: makeMutable(0),
    buttonRef: createRef<View>(),
    measure: { current: null },
    counter: { current: 0 },
  };
}

/** افکت یک کلمه‌ی پنهانِ تازه‌پیداشده را شروع می‌کند. */
export function triggerHiddenWord(fx: HiddenWordFx, word: string): void {
  const index = fx.counter.current++;
  const lane = fx.lanes[index % fx.lanes.length];
  // مختصات دکمه هم‌زمان با شروع تازه می‌شود؛ پرواز تا چند فریم بعد به آن نیاز ندارد.
  fx.measure.current?.();
  lane.word.value = word;
  lane.seed.value = index + 1;
  lane.progress.value = 0;
  lane.progress.value = withTiming(1, { duration: HIDDEN_FX_MS, easing: Easing.linear });
}
