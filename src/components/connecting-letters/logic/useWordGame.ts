import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FEEDBACK_FADE_MS, FEEDBACK_HOLD_MS } from '../constants/constants';
import { useLatest } from '../hooks/useLatest';
import type { ConnectingLettersProps, FoundWords, GameModel, Verdict, WordBarState } from '../types';
import { triggerHiddenWord, type HiddenWordFx } from '../engine/hiddenWordFx';
import { revealSlot, showHint, type SlotEffects } from './slotEffects';
import {
  countHelpPerSlot,
  evaluateWord,
  isPuzzleComplete,
  nextHelpIndex,
  slotOfLetter,
  slotOfWord,
  type WordKind,
} from './words';
import type { AppDispatch } from '../../../redux/store/Store';
import { findingOneNewHiddenWord } from '../../../redux/slices/hiddenWordSlice';
import { showToast } from '../../custom-toast/ToastRef';
import {
  connectingLetterDuplicateSound,
  connectingLetterErrorSound,
  connectingLetterSucccessSound,
  deselectCardSoundInLettersConnecting,
  selectCardSoundInLettersConnecting,
} from '../../../utils/sound/SoundFunctions';
import { vibrate } from '../../../utils/vibrationManager';

type Callbacks = Pick<
  ConnectingLettersProps,
  | 'saveMainWordBuilded'
  | 'saveNewAdditionalWordsBuilded'
  | 'saveNewHiddenWordsBuilded'
  | 'completedOperation'
  | 'saveUserHelpRequests'
>;

export interface WordGame {
  bar: WordBarState;
  /** سمت JSِ انتخاب یک کارت؛ موتور صفحه صدایش می‌زند. */
  onPick: (index: number) => void;
  /** سمت JSِ ثبت کلمه؛ موتور صفحه صدایش می‌زند. */
  onCommit: () => void;
  /** یک حرف دیگر را آشکار می‌کند. برمی‌گرداند که راهنما مصرف شد یا نه (با `true` سکه کم می‌شود). */
  applyForHelp: () => boolean;
}

const EMPTY_BAR: WordBarState = { letters: [], verdict: null, fading: false, key: 0 };

const VERDICT_SOUND: Record<Verdict, () => void> = {
  success: connectingLetterSucccessSound,
  error: connectingLetterErrorSound,
  duplicate: connectingLetterDuplicateSound,
};

/**
 * کاری که نباید نمایش را معطل کند (ذخیره در Realm، dispatch) را بعد از فریم بعدی انجام می‌دهد؛
 * تا آن موقع انیمیشن روی UI thread شروع شده است. بعد از unmount هم اجرا می‌شود تا چیزی ذخیره‌نشده نماند.
 */
const afterNextFrame = (task: () => void) => requestAnimationFrame(() => setTimeout(task, 0));

/**
 * قوانین و پیشرفت بازی: کلمه‌ی در حال ساخت، نتیجه‌اش، کلمه‌های پیداشده، راهنماها و پایان معما.
 *
 * پیشرفت فقط در ref نگه داشته می‌شود؛ نمایشش با `SlotEffects` روی UI thread است، پس پیدا شدن
 * کلمه یا استفاده از راهنما هیچ رندر React‌ای ایجاد نمی‌کند. همه‌ی callbackها پایدارند.
 */
export function useWordGame(
  model: GameModel,
  slotFx: SlotEffects,
  hiddenFx: HiddenWordFx,
  callbacks: Callbacks,
): WordGame {
  const dispatch = useDispatch<AppDispatch>();
  const latest = useLatest(callbacks);

  const foundRef = useRef<FoundWords>(model.initialFound);
  const helpRef = useRef<readonly number[]>(model.initialHelpUsed);
  const [bar, setBar] = useState<WordBarState>(EMPTY_BAR);
  const pendingRef = useRef<string[]>([]);
  // معمایی که از قبل حل شده باز می‌شود نباید دوباره «پایان» را گزارش کند.
  const completedRef = useRef(isPuzzleComplete(model, model.initialFound));
  const barTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearBarTimers = useCallback(() => {
    barTimers.current.forEach(clearTimeout);
    barTimers.current = [];
  }, []);
  useEffect(() => clearBarTimers, [clearBarTimers]);

  const recordFound = useCallback(
    (kind: WordKind, word: string) => {
      const current = foundRef.current;
      const next: FoundWords =
        kind === 'main'
          ? { ...current, main: true }
          : kind === 'target'
          ? { ...current, targets: new Set(current.targets).add(word) }
          : { ...current, hidden: new Set(current.hidden).add(word) };
      foundRef.current = next;

      const slot = slotOfWord(model, kind, word);
      if (slot !== -1) {
        revealSlot(slotFx, slot);
      }
      if (kind === 'hidden') {
        // افکت همین‌جا و بدون انتظار برای ذخیره‌سازی شروع می‌شود؛ بقیه‌اش روی UI thread است.
        triggerHiddenWord(hiddenFx, word);
      }
      const completes = !completedRef.current && isPuzzleComplete(model, next);
      if (completes) {
        completedRef.current = true;
      }

      afterNextFrame(() => {
        const save = latest.current;
        if (kind === 'main') {
          save.saveMainWordBuilded();
        } else if (kind === 'target') {
          save.saveNewAdditionalWordsBuilded(word);
        } else {
          dispatch(findingOneNewHiddenWord());
          save.saveNewHiddenWordsBuilded(word);
        }
        if (completes) {
          save.completedOperation();
        }
      });
    },
    [dispatch, latest, model, slotFx, hiddenFx],
  );

  const onPick = useCallback(
    (index: number) => {
      const letter = model.letters[index];
      if (letter === undefined) {
        return;
      }
      // صدا اولین کار است، پیش از هر کار دیگری روی JS thread، تا کمترین تأخیر را بعد از لمس داشته باشد.
      selectCardSoundInLettersConnecting();
      clearBarTimers();
      const startsNewWord = pendingRef.current.length === 0;
      const letters = [...pendingRef.current, letter];
      pendingRef.current = letters;
      setBar(prev => ({ letters, verdict: null, fading: false, key: startsNewWord ? prev.key + 1 : prev.key }));
      // ویبره بعد از رندر نوار کلمه؛ مثل صدا حس فوری لازم ندارد.
      requestAnimationFrame(vibrate);
    },
    [model, clearBarTimers],
  );

  const onCommit = useCallback(() => {
    const letters = pendingRef.current;
    pendingRef.current = [];
    if (letters.length === 0) {
      return;
    }

    const result = evaluateWord(letters.join(''), model, foundRef.current);
    // اول انیمیشن (روی UI thread)، بعد صدا و نوار کلمه؛ ذخیره‌سازی بعد از فریم بعدی.
    if (result.verdict === 'success' && result.kind !== null && result.word !== null) {
      recordFound(result.kind, result.word);
    }
    deselectCardSoundInLettersConnecting();
    VERDICT_SOUND[result.verdict]();

    clearBarTimers();
    setBar(prev => ({ ...prev, letters, verdict: result.verdict, fading: false }));
    barTimers.current.push(
      setTimeout(() => setBar(prev => ({ ...prev, fading: true })), FEEDBACK_HOLD_MS),
      setTimeout(() => setBar(prev => ({ ...EMPTY_BAR, key: prev.key })), FEEDBACK_HOLD_MS + FEEDBACK_FADE_MS),
    );
  }, [model, recordFound, clearBarTimers]);

  const applyForHelp = useCallback((): boolean => {
    const index = nextHelpIndex(model, foundRef.current, helpRef.current);
    if (index === null) {
      showToast({
        title: 'راهنما یافت نشد',
        message: 'آیتمی برای راهنمایی موجود نیست!',
        type: 'error',
        animationType: 'slide',
        position: 'top',
      });
      return false;
    }
    const next = [...helpRef.current, index];
    helpRef.current = next;
    const slot = slotOfLetter(model, index);
    showHint(slotFx, slot, countHelpPerSlot(model, next)[slot]);
    afterNextFrame(() => latest.current.saveUserHelpRequests(next));
    return true;
  }, [model, slotFx, latest]);

  return { bar, onPick, onCommit, applyForHelp };
}
