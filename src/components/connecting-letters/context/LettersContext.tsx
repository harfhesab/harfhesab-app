import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { SharedValue, withTiming } from 'react-native-reanimated';
import { useFrameCallback, useSharedValue, Easing as ReanimatedEasing } from 'react-native-reanimated';
import Realm from 'realm';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  CARD_SIZE_FLOATING,
  CARD_SELECTION_DURATION,
  CARD_SIZE_SELECTED,
  MAX_VELOCITY,
  MIN_VELOCITY,
} from '../constants/constants';
import { deselectCardSoundInLettersConnecting, tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import Toast from 'react-native-toast-message';
import {
  saveMainWordBuildedInStageGame,
  saveNewAdditionalWordsBuildedInStageGame,
  saveNewHiddenWordsBuildedInStageGame,
  saveUnknownWordCompletedInStageGame,
  saveUserHelpRequestsInStageGame
} from '../../../realm/repositories/user/user-stage-game-progress.repository';
import { unknownWordCompletedInStageGame } from '../functions/StageGameFunctions';
import { saveMainWordBuildedInPackageGame, saveNewAdditionalWordsBuildedInPackageGame, saveNewHiddenWordsBuildedInPackageGame, saveUnknownWordCompletedInPackageGame } from '../../../realm/repositories/user/user-package-game-progress.repository';
import { unknownWordCompletedInPackageGame } from '../functions/PackageGameFunctions';

interface Position { x: number; y: number; }
interface Velocity { vx: number; vy: number; }

interface SubmittedInfo {
  word: string;
  letters: string[];
}

interface Card {
  id: string;
  letter: string;
  startPosition: Position;
  position: SharedValue<Position>;
  velocity: SharedValue<Velocity>;
  cardSize: SharedValue<number>;
  fontSize: SharedValue<number>;
  selected: SharedValue<number>; // 0 = normal, 1 = selected
}

interface ContextProps {
  registerCard: (card: Card) => void;
  data: any;
  selectCard: (id: string) => void;
  connectedLetters: string[];
  submittedInfo: SubmittedInfo | null;
  setSubmittedInfo: (info: SubmittedInfo | null) => void;
  selectionProgressRN: SharedValue<number>;
  manualDeselectAll: () => void;
  manualStartProgressTimer: () => void;
  lettersHelpUsed: number[];
  type: string;
  applyForHelp: () => void;
  foundWords: {main: boolean; additional: any; hidden: any;};
  handleMainWordFound: () => void;
  handleNewAdditionalWordFound: (word: string) => void;
  handleNewHiddenWordFound: (word: string) => void;
}

const LettersContext = createContext<ContextProps>({} as ContextProps);
interface FoundWords {
  main: boolean;
  additional: Set<string>;
  hidden: Set<string>;
}
export const LettersProvider: React.FC<{
  children: React.ReactNode;
  realm: Realm;
  data: any;
  type: string;
  stageId: string;
  partIndex: number;
  wordId: string;
}> = ({ children, realm, data, type, stageId, partIndex, wordId }) => {
  const [connectedLetters, setConnectedLetters] = useState<string[]>([]);
  const [submittedInfo, setSubmittedInfo] = useState<SubmittedInfo | null>(null);
  const [lettersHelpUsed, setLettersHelpUsed] = useState<number[]>(data.letters_help_used || [])

  const connectedLettersRef = useRef<string[]>([]);
  const selectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardsRefArray = useRef<Card[]>([]);
  const cardsMapRef = useRef<Record<string, Card>>({}); // برای دسترسی سریع بر اساس id

  const selectionProgressRN = useSharedValue(0);

  const [foundWords, setFoundWords] = useState<FoundWords>({
    main: data.word_builded || false,
    additional: new Set(data.additional_words_builded || []),
    hidden: new Set(data.hidden_words_builded || [])
  });
  const handleMainWordFound = () => {
    setFoundWords(prevState => {
      const newState = { ...prevState, main: true };
      checkCompleted(newState)
      return newState;
    });
    if(type == "stage-game"){
      saveMainWordBuildedInStageGame( realm, stageId, partIndex, wordId );
    } else if(type == "package-game"){
      saveMainWordBuildedInPackageGame( realm, stageId, partIndex, wordId );
    }
  };
  const handleNewAdditionalWordFound = (word: string) => {
    setFoundWords(prevState => {
      const newAdditional = new Set(prevState.additional);
      newAdditional.add(word);
      const newState = { ...prevState, additional: newAdditional };
      checkCompleted(newState)
      return newState;
    });
    if(type == "stage-game"){
      saveNewAdditionalWordsBuildedInStageGame( realm, stageId, partIndex, wordId, word );
    } else if(type == "package-game"){
      saveNewAdditionalWordsBuildedInPackageGame( realm, stageId, partIndex, wordId, word );
    }
  };
  const handleNewHiddenWordFound = (word: string) => {
    setFoundWords(prevState => {
      const newHidden = new Set(prevState.hidden);
      newHidden.add(word);
      return { ...prevState, hidden: newHidden };
    });
    if(type == "stage-game"){
      saveNewHiddenWordsBuildedInStageGame( realm, stageId, partIndex, wordId, word );
    } else if(type == "package-game"){
      saveNewHiddenWordsBuildedInPackageGame( realm, stageId, partIndex, wordId, word );
    }
  };
  const checkCompleted = (newState: FoundWords): void => {
    const { additional_words } = data;
    if (newState.main && additional_words.every((word: string) => newState.additional.has(word))) {
      if(type == "stage-game"){
        saveUnknownWordCompletedInStageGame( realm, stageId, partIndex, wordId );
        setTimeout(()=>{
          unknownWordCompletedInStageGame()
        }, 500)
      } else if(type == "package-game"){
        saveUnknownWordCompletedInPackageGame( realm, stageId, partIndex, wordId );
        setTimeout(()=>{
          unknownWordCompletedInPackageGame()
        }, 500)
      }
    }
  };

  function applyForHelp() {
    const { additional_words, word } = data;
    const allWords = [...additional_words, word];
    let currentIndex = 0;
    for (let i = 0; i < allWords.length; i++) {
      const w = allWords[i];
      const start = currentIndex;
      const end = currentIndex + w.length - 1;
      if (i < additional_words.length) {
        if (foundWords.additional.has(w)) {
          currentIndex = end + 1;
          continue;
        }
      } else {
        if (foundWords.main) {
          break;
        }
      }
      for (let idx = start; idx <= end; idx++) {
        if (!lettersHelpUsed.includes(idx)) {
          const newLettersHelpUsed = [...lettersHelpUsed, idx];
          setLettersHelpUsed(newLettersHelpUsed);

          if (type === "stage-game") {
            saveUserHelpRequestsInStageGame(
              realm,
              stageId,
              partIndex,
              wordId,
              newLettersHelpUsed
            );
          }
          return true;
        }
      }
      currentIndex = end + 1;
    }
    Toast.show({
      type: "error",
      text1: "آیتمی برای راهنمایی موجود نیست!",
      topOffset: 10,
    });
    return false;
  }


  const startSelectionProgress = useCallback(() => {
    selectionProgressRN.value = 0;
    selectionProgressRN.value = withTiming(1, {
      duration: CARD_SELECTION_DURATION,
      easing: ReanimatedEasing.linear,
    });
  }, [selectionProgressRN]);

  useEffect(() => {
    connectedLettersRef.current = connectedLetters;
  }, [connectedLetters]);

  const registerCard = useCallback((card: Card) => {
    if (cardsMapRef.current[card.id]) return; // جلوگیری از اضافه شدن مجدد
    cardsRefArray.current.push(card);
    cardsMapRef.current[card.id] = card;
  }, []);

  const clearSelectionTimer = useCallback(() => {
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = null;
    }
  }, []);

  const deselectAll = useCallback(() => {
    const currentLetters = connectedLettersRef.current;
    if (currentLetters.length > 0) {
      setSubmittedInfo({
        word: currentLetters.join(''),
        letters: currentLetters,
      });
    }
    setConnectedLetters([]);

    // فقط SharedValue ها را آپدیت کن، بدون setState اضافی
    for (const c of cardsRefArray.current) {
      try {
        if (c.selected.value === 1) c.selected.value = 0;
      } catch {}
    }
    selectionProgressRN.value = 1;
    delayTimerRef.current = setTimeout(() => {
      selectionProgressRN.value = 0;
    }, 3000);
    deselectCardSoundInLettersConnecting();
  }, []);

  const manualDeselectAll = useCallback(() => {
    deselectAll();
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = null;
    }
    tabScreenSoundInOnClick()
  }, []);

  const manualStartProgressTimer = useCallback(()=>{
    clearSelectionTimer();
    startSelectionProgress();
    if(delayTimerRef.current) clearTimeout(delayTimerRef.current);
    selectionTimerRef.current = setTimeout(() => {
      deselectAll();
      selectionTimerRef.current = null;
    }, CARD_SELECTION_DURATION);
    tabScreenSoundInOnClick()
  }, []);

  const selectCard = useCallback((id: string) => {
    if (submittedInfo) setSubmittedInfo(null);
    if(delayTimerRef.current) clearTimeout(delayTimerRef.current);
    const card = cardsMapRef.current[id];
    if (!card) return;
    card.selected.value = 1;

    setConnectedLetters(prev => [...prev, card.letter]);

    clearSelectionTimer();
    startSelectionProgress();
    selectionTimerRef.current = setTimeout(() => {
      deselectAll();
      selectionTimerRef.current = null;
    }, CARD_SELECTION_DURATION);
  }, [clearSelectionTimer, deselectAll, submittedInfo]);

  // ---------- frameCallback: حرکت و برخورد ----------
  const frameCallback = useFrameCallback(() => {
    'worklet';
    const dt = 0.016; // عدد ثابت برای ثبات حرکت کارت‌ها
    const cards = cardsRefArray.current;
    const n = cards.length;
    if (n === 0) return;

    // مرحله 1: حرکت و برخورد با دیواره‌ها
    for (let i = 0; i < n; i++) {
      const card = cards[i];
      const pos = card.position.value;
      const vel = card.velocity.value;

      if (!pos || !vel) continue;

      let speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
      if (speed > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / speed;
        vel.vx *= scale;
        vel.vy *= scale;
      } else if (speed < MIN_VELOCITY && speed > 0) {
        const scale = MIN_VELOCITY / speed;
        vel.vx *= scale;
        vel.vy *= scale;
      }

      const size = card.cardSize.value ?? CARD_SIZE_FLOATING;
      let newX = pos.x + vel.vx * dt;
      let newY = pos.y + vel.vy * dt;

      if (newX < 0) { newX = 0; vel.vx *= -1; }
      else if (newX > BOUNDARY_WIDTH - size) { newX = BOUNDARY_WIDTH - size; vel.vx *= -1; }

      if (newY < 0) { newY = 0; vel.vy *= -1; }
      else if (newY > BOUNDARY_HEIGHT - size) { newY = BOUNDARY_HEIGHT - size; vel.vy *= -1; }

      card.position.value = { x: newX, y: newY };
      card.velocity.value = { vx: vel.vx, vy: vel.vy };
    }

    // مرحله 2: برخورد کارت‌ها (O(n^2) اما فقط SharedValue ها)
    for (let i = 0; i < n; i++) {
      const cardA = cards[i];
      for (let j = i + 1; j < n; j++) {
        const cardB = cards[j];

        if (cardA.selected.value !== cardB.selected.value) continue;

        const posA = cardA.position.value;
        const posB = cardB.position.value;
        const sizeA = cardA.cardSize.value ?? CARD_SIZE_FLOATING;
        const sizeB = cardB.cardSize.value ?? CARD_SIZE_FLOATING;

        const cardRect = { left: posA.x, right: posA.x + sizeA, top: posA.y, bottom: posA.y + sizeA };
        const otherRect = { left: posB.x, right: posB.x + sizeB, top: posB.y, bottom: posB.y + sizeB };

        const isColliding =
          cardRect.left < otherRect.right &&
          cardRect.right > otherRect.left &&
          cardRect.top < otherRect.bottom &&
          cardRect.bottom > otherRect.top;
        if (!isColliding) continue;

        const overlapX = Math.min(cardRect.right - otherRect.left, otherRect.right - cardRect.left);
        const overlapY = Math.min(cardRect.bottom - otherRect.top, otherRect.bottom - cardRect.top);

        let dx = 0, dy = 0;
        if (overlapX < overlapY) dx = cardRect.left < otherRect.left ? -overlapX/2 : overlapX/2;
        else dy = cardRect.top < otherRect.top ? -overlapY/2 : overlapY/2;

        posA.x += dx; posA.y += dy;
        posB.x -= dx; posB.y -= dy;

        const nx = dx !== 0 ? (dx>0?1:-1) : 0;
        const ny = dy !== 0 ? (dy>0?1:-1) : 0;

        const velA = cardA.velocity.value;
        const velB = cardB.velocity.value;

        const dot = (velA.vx - velB.vx)*nx + (velA.vy - velB.vy)*ny;
        if (dot < 0) {
          const impulse = dot;
          velA.vx -= impulse * nx; velA.vy -= impulse * ny;
          velB.vx += impulse * nx; velB.vy += impulse * ny;
        }

        cardA.position.value = { x: posA.x, y: posA.y };
        cardB.position.value = { x: posB.x, y: posB.y };
        cardA.velocity.value = velA;
        cardB.velocity.value = velB;
      }
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(true);
    return () => {
      frameCallback.setActive(false);
      clearSelectionTimer();
    };
  }, [frameCallback, clearSelectionTimer]);

  return (
    <LettersContext.Provider
      value={{
        registerCard,
        data,
        selectCard,
        connectedLetters,
        submittedInfo,
        setSubmittedInfo,
        selectionProgressRN,
        manualDeselectAll,
        manualStartProgressTimer,
        lettersHelpUsed,
        type,
        applyForHelp,
        foundWords,
        handleMainWordFound,
        handleNewAdditionalWordFound,
        handleNewHiddenWordFound,
      }}
    >
      {children}
    </LettersContext.Provider>
  );
};

export const useLetters = () => useContext(LettersContext);
