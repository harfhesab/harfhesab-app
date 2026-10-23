import { Easing, makeMutable, withTiming, type SharedValue } from 'react-native-reanimated';
import { HINT_POP_MS, REVEAL_BOX_MS, REVEAL_STAGGER } from '../constants/constants';
import type { GameModel } from '../types';
import { countHelpPerSlot, foundPerSlot, slotWords } from './words';

/**
 * وضعیت نمایشی خانه‌های کلمات، به ترتیب `slotWords`.
 *
 * منطق بازی این مقادیر را مستقیم تغییر می‌دهد و خانه‌ها روی UI thread از روی آن‌ها کشیده می‌شوند؛
 * پس نشستن کلمه یا نمایش حرف راهنما منتظر رندر React یا ذخیره در Realm نمی‌ماند. آرایه‌های `settled`
 * همان وضعیت را بدون انیمیشن روی JS نگه می‌دارند، تا JS هیچ‌وقت لازم نباشد `.value` را بخواند.
 */
export interface SlotEffects {
  /** 0→1: نشستن حروف کلمه در خانه‌ها. */
  reveal: SharedValue<number>[];
  /** تعداد حروف ابتدایی که با راهنما آشکار شده‌اند. */
  hints: SharedValue<number>[];
  /** 0→1: پرش آخرین حرف راهنما؛ 1 یعنی بیکار. */
  hintPop: SharedValue<number>[];
  settled: { reveal: number[]; hints: number[] };
  letterCounts: number[];
}

export function createSlotEffects(model: GameModel): SlotEffects {
  const reveal = foundPerSlot(model, model.initialFound).map(found => (found ? 1 : 0));
  const hints = countHelpPerSlot(model, model.initialHelpUsed);
  return {
    reveal: reveal.map(value => makeMutable(value)),
    hints: hints.map(value => makeMutable(value)),
    hintPop: hints.map(() => makeMutable(1)),
    settled: { reveal, hints },
    letterCounts: slotWords(model).map(word => Array.from(word).length),
  };
}

/** کل مدت نشستن یک کلمه با `letters` حرف. */
export const revealDuration = (letters: number) => REVEAL_BOX_MS * (1 + REVEAL_STAGGER * Math.max(0, letters - 1));

export function revealSlot(fx: SlotEffects, slot: number): void {
  fx.settled.reveal[slot] = 1;
  fx.reveal[slot].value = withTiming(1, { duration: revealDuration(fx.letterCounts[slot]), easing: Easing.linear });
}

export function showHint(fx: SlotEffects, slot: number, count: number): void {
  fx.settled.hints[slot] = count;
  fx.hints[slot].value = count;
  fx.hintPop[slot].value = 0;
  fx.hintPop[slot].value = withTiming(1, { duration: HINT_POP_MS });
}
