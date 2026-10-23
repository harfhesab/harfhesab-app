import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useFrameCallback,
  useSharedValue,
  withTiming,
  type FrameInfo,
  type SharedValue,
} from 'react-native-reanimated';
import { CARD_SELECTION_DURATION, PHYSICS_MAX_DELTA_MS, TOUCH_SLOP } from '../constants/constants';
import { countPicked, pickTile, releaseTiles, stepWorld, tileAt, type WorldConfig } from './physics';
import { createBodies } from './spawn';
import { pushChip, type WordBarFx } from './wordBarFx';

export interface BoardEngine {
  count: number;
  /** وضعیت فشرده‌ی کارت‌ها (`physics.ts`). فقط روی UI thread خوانده و نوشته می‌شود. */
  bodies: SharedValue<number[]>;
  /** همان وضعیت در لحظه‌ی شروع، روی JS؛ برای کشیدن فریم اول بدون خواندن `bodies.value`. */
  initialBodies: readonly number[];
  /** تا وقتی بازیکن هنوز می‌تواند حرف اضافه کند از 1 به 0 می‌رود؛ در حالت بیکار 0 است. */
  countdown: SharedValue<number>;
  /** Worklet: کارت آزادِ زیر (x, y) را انتخاب می‌کند (مختصات محدوده‌ی حرکت). */
  pickAt: (x: number, y: number) => void;
  /** Worklet: کلمه‌ی در حال ساخت را همین الان ثبت می‌کند. */
  commit: () => void;
  /** Worklet: اگر کلمه‌ای در حال ساخت باشد، شمارش معکوس را دوباره پر می‌کند. */
  restartCountdown: () => void;
}

interface Options {
  count: number;
  world: WorldConfig;
  /** حرف هر کارت به شکل نرمال‌شده (`normalizeWord`). */
  tileKeys: readonly string[];
  /** کلمه‌های نرمال‌شده‌ای که به محض کامل شدن، بدون انتظار برای تایمر ثبت می‌شوند. */
  instantWords: readonly string[];
  /** مهره‌های کلمه‌ی در حال ساخت؛ worklet انتخاب همان لحظه آن را به‌روز می‌کند. */
  wordBar: WordBarFx;
  /** شبیه‌سازی را متوقف می‌کند (مثلاً وقتی صفحه‌ی دیگری رویش باز است). */
  active: boolean;
  /** روی JS thread با اندیس هر کارت انتخاب‌شده صدا زده می‌شود. */
  onPick: (index: number) => void;
  /** روی JS thread هنگام ثبت کلمه صدا زده می‌شود (پایان تایمر، کلمه‌ی کامل یا `commit`). */
  onCommit: () => void;
}

/**
 * مالک شبیه‌سازی صفحه و شمارش معکوس انتخاب.
 *
 * UI thread تنها مرجعِ «کدام کارت‌ها انتخاب شده‌اند» و «کلمه کِی ثبت می‌شود» است: لمس‌ها،
 * شمارش معکوس و فیزیک همه آنجا اجرا می‌شوند و JS thread با فراخوانی‌های ترتیب‌دارِ `runOnJS`
 * باخبر می‌شود. به همین دلیل انتخاب دوباره‌ی یک کارت و تداخل انتخاب/ثبت غیرممکن است.
 */
export function useBoardEngine({
  count,
  world,
  tileKeys,
  instantWords,
  wordBar,
  active,
  onPick,
  onCommit,
}: Options): BoardEngine {
  const [initialBodies] = useState(() => createBodies(count, world));
  const bodies = useSharedValue(initialBodies);
  const countdown = useSharedValue(0);
  /** کلمه‌ی در حال ساخت (نرمال‌شده)، روی UI thread. */
  const typed = useSharedValue('');
  const instant = useMemo(() => {
    const lookup: Record<string, true> = {};
    instantWords.forEach(word => {
      lookup[word] = true;
    });
    return lookup;
  }, [instantWords]);

  const commit = useCallback(() => {
    'worklet';
    typed.value = '';
    countdown.value = withTiming(0, { duration: 160 });
    if (releaseTiles(bodies.value, count) > 0) {
      bodies.modify();
      runOnJS(onCommit)();
    }
  }, [bodies, countdown, typed, count, onCommit]);

  const startCountdown = useCallback(() => {
    'worklet';
    countdown.value = 1;
    countdown.value = withTiming(0, { duration: CARD_SELECTION_DURATION, easing: Easing.linear }, finished => {
      if (finished) {
        commit();
      }
    });
  }, [countdown, commit]);

  const pickAt = useCallback(
    (x: number, y: number) => {
      'worklet';
      const index = tileAt(bodies.value, count, x, y, world, TOUCH_SLOP);
      if (index < 0) {
        return;
      }
      pickTile(bodies.value, index);
      bodies.modify();
      // مهره همین‌جا و روی UI thread نمایان می‌شود؛ `typed` خالی یعنی کلمه‌ی جدید شروع شده است.
      pushChip(wordBar, index, typed.value === '');
      typed.value += tileKeys[index];
      runOnJS(onPick)(index);
      // کلمه‌ی کامل منتظر تایمر نمی‌ماند؛ ترتیب runOnJS حفظ می‌شود، پس onPick قبل از onCommit می‌رسد.
      if (instant[typed.value] === true) {
        commit();
      } else {
        startCountdown();
      }
    },
    [bodies, typed, count, world, tileKeys, instant, wordBar, startCountdown, commit, onPick],
  );

  const restartCountdown = useCallback(() => {
    'worklet';
    if (countPicked(bodies.value, count) > 0) {
      startCountdown();
    }
  }, [bodies, count, startCountdown]);

  const step = useCallback(
    (frame: FrameInfo) => {
      'worklet';
      const dt = Math.min(frame.timeSincePreviousFrame ?? 1000 / 60, PHYSICS_MAX_DELTA_MS) / 1000;
      stepWorld(bodies.value, count, dt, world);
      bodies.modify();
    },
    [bodies, count, world],
  );
  const frameCallback = useFrameCallback(step, false);

  useEffect(() => {
    frameCallback.setActive(active);
  }, [frameCallback, active]);

  // شمارش معکوسی که بعد از unmount هنوز در جریان است نباید کلمه‌ای را در صفحه‌ی بسته‌شده ثبت کند.
  useEffect(() => () => cancelAnimation(countdown), [countdown]);

  return useMemo(
    () => ({ count, bodies, initialBodies, countdown, pickAt, commit, restartCountdown }),
    [count, bodies, initialBodies, countdown, pickAt, commit, restartCountdown],
  );
}
