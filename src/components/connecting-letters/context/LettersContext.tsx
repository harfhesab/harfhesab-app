import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { runOnUI } from 'react-native-reanimated';
import type { SkTypeface } from '@shopify/react-native-skia';
import { SUBMIT_COMPLETE_WORDS_INSTANTLY } from '../constants/constants';
import { computeBoardMetrics, type BoardMetrics } from '../engine/metrics';
import { useBoardEngine, type BoardEngine } from '../engine/useBoardEngine';
import { createHiddenWordFx, type HiddenWordFx } from '../engine/hiddenWordFx';
import { createWordBarFx, type WordBarFx } from '../engine/wordBarFx';
import { useGuide } from '../hooks/useGuide';
import { useLatest } from '../hooks/useLatest';
import { useScreenFocus } from '../hooks/useScreenFocus';
import { createSlotEffects, type SlotEffects } from '../logic/slotEffects';
import { createGameModel, instantSubmitWords, normalizeWord } from '../logic/words';
import { useWordGame } from '../logic/useWordGame';
import type { ConnectingLettersProps, GameModel, GameType, WordBarState } from '../types';
import { useLetterTypeface } from '../utils/letterFont';
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';

/**
 * state بر اساس دفعات تغییرش تقسیم شده است: انتخاب یک کارت فقط نوار «کلمه‌ی فعلی» را دوباره رندر
 * می‌کند. پیدا شدن کلمه و راهنما اصلاً رندر React ندارند؛ مستقیم از `SlotEffects` روی UI thread کشیده می‌شوند.
 */

/** در طول عمر یک معما ثابت است (یا تا وقتی اندازه‌ی پنجره یا فونت عوض شود). */
export interface LettersStatic {
  type: GameType;
  model: GameModel;
  metrics: BoardMetrics;
  /** تا وقتی فونت حروف در حال بارگذاری است `null` است. */
  typeface: SkTypeface | null;
  engine: BoardEngine;
  slotFx: SlotEffects;
  /** مهره‌های کلمه‌ی در حال ساخت (روی UI thread). */
  wordBar: WordBarFx;
  /** افکت پیدا شدن کلمه‌ی پنهان (روی UI thread). */
  hiddenFx: HiddenWordFx;
  timeLimitData: ConnectingLettersProps['timeLimitData'];
  gameTimeIsOver: () => void;
  applyForHelp: () => boolean;
  /** شمارش معکوس را دوباره کامل می‌کند. */
  restartTimer: () => void;
  /** کلمه‌ی در حال ساخت را همین الان ثبت می‌کند. */
  submitNow: () => void;
}

const StaticContext = createContext<LettersStatic | null>(null);
const SelectionContext = createContext<WordBarState | null>(null);

function useRequiredContext<T>(context: React.Context<T | null>, name: string): T {
  const value = useContext(context);
  if (value === null) {
    throw new Error(`${name} must be used inside <LettersProvider>`);
  }
  return value;
}

export const useLettersStatic = () => useRequiredContext(StaticContext, 'useLettersStatic');
/** با هر انتخاب و هر نتیجه تغییر می‌کند. */
export const useLettersSelection = () => useRequiredContext(SelectionContext, 'useLettersSelection');

export function LettersProvider({ children, ...props }: ConnectingLettersProps & { children: ReactNode }) {
  const [model] = useState(() => createGameModel(props.type, props.data));
  const [slotFx] = useState(() => createSlotEffects(model));
  const [wordBar] = useState(() => createWordBarFx(model.letters.length));
  const [hiddenFx] = useState(() => createHiddenWordFx());
  const { tileKeys, instantWords } = useMemo(
    () => ({
      tileKeys: model.letters.map(normalizeWord),
      instantWords: SUBMIT_COMPLETE_WORDS_INSTANTLY ? instantSubmitWords(model) : [],
    }),
    [model],
  );
  const { width, height } = useWindowDimensions();
  const metrics = useMemo(
    () => computeBoardMetrics(width, height, model.letters.length),
    [width, height, model.letters.length],
  );
  const typeface = useLetterTypeface();
  const focused = useScreenFocus();

  const game = useWordGame(model, slotFx, hiddenFx, props);
  const engine = useBoardEngine({
    count: model.letters.length,
    world: metrics.world,
    tileKeys,
    instantWords,
    wordBar,
    active: focused,
    onPick: game.onPick,
    onCommit: game.onCommit,
  });
  useGuide(model, props.stageNumber, model.type);

  const latestProps = useLatest(props);
  const gameTimeIsOver = useCallback(() => latestProps.current.gameTimeIsOver?.(), [latestProps]);
  const restartTimer = useCallback(() => {
    tabScreenSoundInOnClick();
    runOnUI(engine.restartCountdown)();
  }, [engine]);
  const submitNow = useCallback(() => {
    tabScreenSoundInOnClick();
    runOnUI(engine.commit)();
  }, [engine]);

  const { timeLimitData } = props;
  const staticValue = useMemo<LettersStatic>(
    () => ({
      type: model.type,
      model,
      metrics,
      typeface,
      engine,
      slotFx,
      wordBar,
      hiddenFx,
      timeLimitData,
      gameTimeIsOver,
      applyForHelp: game.applyForHelp,
      restartTimer,
      submitNow,
    }),
    [model, metrics, typeface, engine, slotFx, wordBar, hiddenFx, timeLimitData, gameTimeIsOver, game.applyForHelp, restartTimer, submitNow],
  );

  return (
    <StaticContext.Provider value={staticValue}>
      <SelectionContext.Provider value={game.bar}>{children}</SelectionContext.Provider>
    </StaticContext.Provider>
  );
}
