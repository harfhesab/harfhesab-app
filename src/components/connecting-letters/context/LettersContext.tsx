import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { SharedValue, withTiming } from 'react-native-reanimated';
import { useFrameCallback, useSharedValue, Easing as ReanimatedEasing } from 'react-native-reanimated';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  CARD_SIZE_FLOATING,
  CARD_SELECTION_DURATION,
  MAX_VELOCITY,
  MIN_VELOCITY,
  PHYSICS_MAX_DELTA_MS,
  COLLISION_RESTITUTION,
} from '../constants/constants';
import { deselectCardSoundInLettersConnecting, tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import { showToast } from '../../custom-toast/ToastRef';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../../redux/store/RootReducer';
import { AppDispatch } from '../../../redux/store/Store';
import { findingOneNewHiddenWord } from '../../../redux/slices/hiddenWordSlice';

interface SubmittedInfo {
  word: string;
  letters: string[];
}

// توجه: به‌جای یک SharedValue آبجکتی {x,y} از دو SharedValue عددی جدا استفاده می‌کنیم.
// دلیل: در worklet فیزیک، هر فریم برای هر کارت مقدار position/velocity خوانده و نوشته می‌شود.
// اگر این مقدار یک آبجکت باشد، هر بار نوشتن (card.position.value = {x, y}) یک آبجکت جدید
// روی UI thread تخصیص می‌دهد. با N کارت در ۶۰fps این یعنی تخصیص/GC مداوم که می‌تواند
// روی گوشی‌های ضعیف باعث افت نرمی (jank) شود. SharedValue عددی این تخصیص را کاملاً حذف می‌کند.
interface Card {
  id: string;
  letter: string;
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;
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
  data: any;
  type: string;
  stageNumber: number | undefined;
  saveMainWordBuilded:()=>void;
  saveNewAdditionalWordsBuilded:(word: string)=>void;
  saveNewHiddenWordsBuilded:(word: string)=>void;
  completedOperation:()=>void;
  saveUserHelpRequests:(newLettersHelpUsed: number[])=>void;
}> = ({
  children,
  data,
  type,
  stageNumber,
  saveMainWordBuilded,
  saveNewAdditionalWordsBuilded,
  saveNewHiddenWordsBuilded,
  completedOperation,
  saveUserHelpRequests,
}) => {
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
    saveMainWordBuilded()
  };

  const handleNewAdditionalWordFound = (word: string) => {
    setFoundWords(prevState => {
      const newAdditional = new Set(prevState.additional);
      newAdditional.add(word);
      const newState = { ...prevState, additional: newAdditional };
      checkCompleted(newState)
      return newState;
    });
    saveNewAdditionalWordsBuilded(word)
  };

  const handleNewHiddenWordFound = (word: string) => {
    setFoundWords(prevState => {
      const newHidden = new Set(prevState.hidden);
      newHidden.add(word);
      return { ...prevState, hidden: newHidden };
    });
    dispatch(findingOneNewHiddenWord())
    saveNewHiddenWordsBuilded(word)
  };

  const checkCompleted = (newState: FoundWords): void => {
    const { additional_words } = data;
    if (newState.main && additional_words.every((word: string) => newState.additional.has(word))) {
      completedOperation()
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
          saveUserHelpRequests(newLettersHelpUsed)
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
    const card = cardsMapRef.current[id];
    if (!card) return;
    // جلوگیری از انتخاب دوباره‌ی کارتی که همین الان انتخاب شده (کوچک و پشت بقیه است).
    // در نسخه‌ی قبلی این گارد وجود نداشت؛ اگر کاربر روی یک کارت انتخاب‌شده دوباره لمس
    // موفق می‌داشت (مثلاً لحظه‌ای که از پشت کارت‌های دیگر آزاد می‌شود)، حرف آن دوباره
    // به connectedLetters اضافه می‌شد و کلمه‌ی ساخته‌شده اشتباه می‌شد.
    if (card.selected.value === 1) return;

    if (submittedInfo) setSubmittedInfo(null);
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
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
  // Frame Callback: مدیریت فیزیک و برخورد
  // =========================================================================
  const frameCallback = useFrameCallback((frameInfo) => {
    'worklet';
    const cards = cardsRefArray.current;
    const n = cards.length;
    if (n === 0) return;

    // به‌جای dt ثابت ۰.۰۱۶ (فرض ۶۰fps)، از زمان واقعی بین دو فریم استفاده می‌کنیم.
    // چرا مهم است: useFrameCallback با نرخ رفرش واقعی صفحه اجرا می‌شود (۶۰ / ۹۰ / ۱۲۰Hz
    // بسته به گوشی). با dt ثابت، روی گوشی ۱۲۰Hz توپ‌ها دقیقاً دو برابر سریع‌تر از حالت
    // ۶۰Hz حرکت می‌کنند و روی گوشی‌ای که فریم افت می‌کند (مثلاً ۳۰fps) کندتر از واقعیت
    // به نظر می‌رسند. با dt واقعی، سرعت حرکت روی همه‌ی دستگاه‌ها یکسان و قابل پیش‌بینی است.
    // clamp هم برای جلوگیری از "جهش" بزرگ بعد از برگشت از background یا افت فریم سنگین است.
    const rawDeltaMs = frameInfo.timeSincePreviousFrame ?? 16.6667;
    const dt = Math.min(rawDeltaMs, PHYSICS_MAX_DELTA_MS) / 1000;

    // مرحله ۱: حرکت و برخورد با دیواره‌ها
    for (let i = 0; i < n; i++) {
      const card = cards[i];
      let x = card.x.value;
      let y = card.y.value;
      let vx = card.vx.value;
      let vy = card.vy.value;
      const currentSize = card.cardSize.value ?? CARD_SIZE_FLOATING;

      if (isNaN(x) || isNaN(y) || isNaN(vx) || isNaN(vy)) {
        continue;
      }

      let speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / speed;
        vx *= scale;
        vy *= scale;
      } else if (speed < MIN_VELOCITY && speed > 0) {
        const scale = MIN_VELOCITY / speed;
        vx *= scale;
        vy *= scale;
      }

      let newX = x + vx * dt;
      let newY = y + vy * dt;

      if (newX < 0) { newX = 0; vx = -vx; }
      else if (newX > BOUNDARY_WIDTH - currentSize) { newX = BOUNDARY_WIDTH - currentSize; vx = -vx; }

      if (newY < 0) { newY = 0; vy = -vy; }
      else if (newY > BOUNDARY_HEIGHT - currentSize) { newY = BOUNDARY_HEIGHT - currentSize; vy = -vy; }

      card.x.value = newX;
      card.y.value = newY;
      card.vx.value = vx;
      card.vy.value = vy;
    }

    // مرحله ۲: برخورد کارت‌ها با یکدیگر
    for (let i = 0; i < n; i++) {
      const cardA = cards[i];
      for (let j = i + 1; j < n; j++) {
        const cardB = cards[j];

        // منطق مهم: کارت‌های کوچک فقط با هم، کارت‌های بزرگ فقط با هم
        // اگر وضعیت انتخاب یکی نباشد (یکی کوچک یکی بزرگ)، از هم رد می‌شوند
        if (cardA.selected.value !== cardB.selected.value) continue;

        const ax = cardA.x.value;
        const ay = cardA.y.value;
        const bx = cardB.x.value;
        const by = cardB.y.value;

        const sizeA = cardA.cardSize.value ?? CARD_SIZE_FLOATING;
        const sizeB = cardB.cardSize.value ?? CARD_SIZE_FLOATING;

        const isColliding =
          ax < bx + sizeB &&
          ax + sizeA > bx &&
          ay < by + sizeB &&
          ay + sizeA > by;

        if (!isColliding) continue;

        const overlapX = Math.min(ax + sizeA - bx, bx + sizeB - ax);
        const overlapY = Math.min(ay + sizeA - by, by + sizeB - ay);

        let dx = 0;
        let dy = 0;
        if (overlapX < overlapY) {
          dx = ax < bx ? -overlapX / 2 : overlapX / 2;
        } else {
          dy = ay < by ? -overlapY / 2 : overlapY / 2;
        }

        const nx = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
        const ny = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

        let avx = cardA.vx.value;
        let avy = cardA.vy.value;
        let bvx = cardB.vx.value;
        let bvy = cardB.vy.value;

        const relativeVx = avx - bvx;
        const relativeVy = avy - bvy;
        const dot = relativeVx * nx + relativeVy * ny;

        if (dot < 0) {
          const impulse = dot * COLLISION_RESTITUTION;
          avx -= impulse * nx; avy -= impulse * ny;
          bvx += impulse * nx; bvy += impulse * ny;
          cardA.vx.value = avx;
          cardA.vy.value = avy;
          cardB.vx.value = bvx;
          cardB.vy.value = bvy;
        }

        cardA.x.value = ax + dx;
        cardA.y.value = ay + dy;
        cardB.x.value = bx - dx;
        cardB.y.value = by - dy;
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