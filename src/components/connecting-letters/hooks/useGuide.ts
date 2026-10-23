import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { GameModel } from '../types';
import type { RootState } from '../../../redux/store/RootReducer';
import type { AppDispatch } from '../../../redux/store/Store';

const GUIDE_DELAY_MS = 3000;
const GUIDE_LAST_STAGE = 4;

export function useGuide(model: GameModel, stageNumber: number | undefined, type: string): void {
  const dispatch = useDispatch<AppDispatch>();
  const isWordGame = type === 'word-game';

  const guideSeen = useSelector((state: RootState) =>
    isWordGame ? state.setting.wordGameGuide : state.setting.connectingLetterGuide,
  );

  // فقط یک بار هنگام mount تصمیم گرفته می‌شود.
  const [shouldShow] = useState(() => {
    if (guideSeen !== false || !stageNumber) return false;
    return isWordGame ? stageNumber === 1 : stageNumber <= GUIDE_LAST_STAGE;
  });

  useEffect(() => {
    if (!shouldShow) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const guide = await import('../../../utils/functions/Guide');
      if (cancelled) return;

      if (isWordGame) {
        guide.showWordGameGuide({
          dispatch,
          letters: model.letters,
          words: model.targetWords,
        });
      } else {
        guide.showConnectingLetterGuide({
          dispatch,
          letters: model.letters,
          word: model.mainWord,
          additionalWords: model.targetWords,
        });
      }
    }, GUIDE_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shouldShow, isWordGame, dispatch, model]);
}