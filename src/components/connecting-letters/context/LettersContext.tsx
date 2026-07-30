import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { SharedValue, withTiming } from 'react-native-reanimated';
import { useFrameCallback, useSharedValue, Easing as ReanimatedEasing } from 'react-native-reanimated';
import Realm from 'realm';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  CARD_SIZE_FLOATING,
  CARD_SELECTION_DURATION,
  MAX_VELOCITY,
  MIN_VELOCITY,
} from '../constants/constants';
import { deselectCardSoundInLettersConnecting, tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import {
  saveMainWordBuildedInStageGame,
  saveNewAdditionalWordsBuildedInStageGame,
  saveNewHiddenWordsBuildedInStageGame,
  saveUnknownWordCompletedInStageGame,
  saveUserHelpRequestsInStageGame
} from '../../../realm/repositories/user/user-stage-game-progress.repository';
import {
  saveMainWordBuildedInPackageGame,
  saveNewAdditionalWordsBuildedInPackageGame,
  saveNewHiddenWordsBuildedInPackageGame,
  saveUnknownWordCompletedInPackageGame,
  saveUserHelpRequestsInPackageGame
} from '../../../realm/repositories/user/user-package-game-progress.repository';
import { showToast } from '../../custom-toast/ToastRef';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../../redux/store/RootReducer';
import { AppDispatch } from '../../../redux/store/Store';
import { findingOneNewHiddenWord } from '../../../redux/slices/hiddenWordSlice';

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
  stageNumber: number | undefined;
}> = ({ children, realm, data, type, stageId, partIndex, wordId, stageNumber }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { connectingLetterGuide } = useSelector((state: RootState) => state.setting);
  const [connectedLetters, setConnectedLetters] = useState<string[]>([]);
  const [submittedInfo, setSubmittedInfo] = useState<SubmittedInfo | null>(null);
  const [lettersHelpUsed, setLettersHelpUsed] = useState<number[]>(data.letters_help_used || [])

  const connectedLettersRef = useRef<string[]>([]);
  const selectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardsRefArray = useRef<Card[]>([]);
  const cardsMapRef = useRef<Record<string, Card>>({}); 

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
    dispatch(findingOneNewHiddenWord())
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
        setTimeout(async()=>{
          const { unknownWordCompletedInStageGame } = await import('../functions/StageGameFunctions');
          unknownWordCompletedInStageGame()
        }, 2000)
      } else if(type == "package-game"){
        saveUnknownWordCompletedInPackageGame( realm, stageId, partIndex, wordId );
        setTimeout(async()=>{
          const { unknownWordCompletedInPackageGame } = await import('../functions/PackageGameFunctions');
          unknownWordCompletedInPackageGame()
        }, 2000)
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
          } else if(type === "package-game"){
            saveUserHelpRequestsInPackageGame(
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
    showToast({
        title: "راهنما یافت نشد",
        message: "آیتمی برای راهنمایی موجود نیست!",
        type: "error",
        animationType: "slide",
        position: "top",
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
    if (cardsMapRef.current[card.id]) return;
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

    // تغییر مقدار selected به 0. انیمیشن بزرگ شدن در FloatingCard هندل می شود.
    // فریم کال‌بک به صورت خودکار با تغییر سایز کارت‌ها، از همپوشانی جلوگیری می‌کند.
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
    clearSelectionTimer();
    tabScreenSoundInOnClick()
  }, [deselectAll, clearSelectionTimer]);

  const manualStartProgressTimer = useCallback(()=>{
    clearSelectionTimer();
    startSelectionProgress();
    if(delayTimerRef.current) clearTimeout(delayTimerRef.current);
    selectionTimerRef.current = setTimeout(() => {
      deselectAll();
      selectionTimerRef.current = null;
    }, CARD_SELECTION_DURATION);
    tabScreenSoundInOnClick()
  }, [clearSelectionTimer, startSelectionProgress, deselectAll]);

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
  }, [clearSelectionTimer, deselectAll, submittedInfo, startSelectionProgress]);

  // =========================================================================
  // Frame Callback: مدیریت فیزیک و برخورد (برگرفته از منطق DragDropContext)
  // =========================================================================
  const frameCallback = useFrameCallback(() => {
    'worklet';
    const cards = cardsRefArray.current;
    const n = cards.length;
    if (n === 0) return;
    const dt = 0.016; 

    // مرحله 1: حرکت و برخورد با دیواره‌ها
    for (let i = 0; i < n; i++) {
      const card = cards[i];
      const pos = card.position.value;
      const vel = card.velocity.value;
      const currentSize = card.cardSize.value ?? CARD_SIZE_FLOATING; // سایز لحظه‌ای کارت

      // بررسی NaN برای جلوگیری از کرش
      if (isNaN(pos.x) || isNaN(pos.y) || isNaN(vel.vx) || isNaN(vel.vy)) {
        continue;
      }

      // محدود کردن سرعت (Velocity Clamping)
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

      let newX = pos.x + vel.vx * dt;
      let newY = pos.y + vel.vy * dt;

      // برخورد با دیواره‌ها
      if (newX < 0) { newX = 0; vel.vx *= -1; }
      else if (newX > BOUNDARY_WIDTH - currentSize) { newX = BOUNDARY_WIDTH - currentSize; vel.vx *= -1; }

      if (newY < 0) { newY = 0; vel.vy *= -1; }
      else if (newY > BOUNDARY_HEIGHT - currentSize) { newY = BOUNDARY_HEIGHT - currentSize; vel.vy *= -1; }

      card.position.value = { x: newX, y: newY };
      card.velocity.value = { vx: vel.vx, vy: vel.vy };
    }

    // مرحله 2: برخورد کارت‌ها با یکدیگر (منطق DragDrop)
    for (let i = 0; i < n; i++) {
      const cardA = cards[i];
      for (let j = i + 1; j < n; j++) {
        const cardB = cards[j];

        // منطق مهم: کارت‌های کوچک فقط با هم، کارت‌های بزرگ فقط با هم
        // اگر وضعیت انتخاب یکی نباشد (یکی کوچک یکی بزرگ)، از هم رد می‌شوند
        if (cardA.selected.value !== cardB.selected.value) continue;

        const posA = cardA.position.value;
        const posB = cardB.position.value;
        const velA = cardA.velocity.value;
        const velB = cardB.velocity.value;
        
        const sizeA = cardA.cardSize.value ?? CARD_SIZE_FLOATING;
        const sizeB = cardB.cardSize.value ?? CARD_SIZE_FLOATING;

        // تعریف مستطیل‌ها
        const rectA = { left: posA.x, right: posA.x + sizeA, top: posA.y, bottom: posA.y + sizeA };
        const rectB = { left: posB.x, right: posB.x + sizeB, top: posB.y, bottom: posB.y + sizeB };

        const isColliding =
          rectA.left < rectB.right &&
          rectA.right > rectB.left &&
          rectA.top < rectB.bottom &&
          rectA.bottom > rectB.top;

        if (isColliding) {
          // محاسبه همپوشانی
          const overlapX = Math.min(rectA.right - rectB.left, rectB.right - rectA.left);
          const overlapY = Math.min(rectA.bottom - rectB.top, rectB.bottom - rectA.top);

          // جابه‌جایی برای رفع همپوشانی (Position Correction) - این بخش جلوی گیر کردن را می‌گیرد
          let dx = 0;
          let dy = 0;
          if (overlapX < overlapY) {
            dx = rectA.left < rectB.left ? -overlapX / 2 : overlapX / 2;
          } else {
            dy = rectA.top < rectB.top ? -overlapY / 2 : overlapY / 2;
          }

          posA.x += dx;
          posA.y += dy;
          posB.x -= dx;
          posB.y -= dy;

          const nx = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
          const ny = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

          // برخورد الاستیک
          const relativeVx = velA.vx - velB.vx;
          const relativeVy = velA.vy - velB.vy;
          const dot = relativeVx * nx + relativeVy * ny;

          if (dot < 0) {
            const impulse = dot;
            velA.vx -= impulse * nx; velA.vy -= impulse * ny;
            velB.vx += impulse * nx; velB.vy += impulse * ny;
          }

          // اعمال مقادیر جدید به SharedValues
          cardA.position.value = { x: posA.x, y: posA.y };
          cardB.position.value = { x: posB.x, y: posB.y };
          cardA.velocity.value = { vx: velA.vx, vy: velA.vy };
          cardB.velocity.value = { vx: velB.vx, vy: velB.vy };
        }
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

  useEffect(() => {
    checkShowGuide()
  }, [])
  const checkShowGuide = async()=>{
    if(connectingLetterGuide == false && stageNumber && stageNumber < 4){
      const { showConnectingLetterGuide } = await import('../../../utils/functions/Guide');
      setTimeout(()=>{
        const letters = data?.letters
        const word = data?.word;
        const additionalWords = data?.additional_words;
        showConnectingLetterGuide({dispatch, letters, word, additionalWords})
      }, 3000)
    }
  }

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