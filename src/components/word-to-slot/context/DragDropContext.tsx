import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrameCallback, withSpring, SharedValue, runOnJS, useSharedValue } from 'react-native-reanimated';
import {
    BOUNDARY_HORIZONTAL_OFFSET,
    BOUNDARY_WIDTH,
    BOUNDARY_HEIGHT,
    CARD_SIZE_FLOATING,
    CARD_SIZE_DRAGGING,
    CARD_SIZE_SLOTTED,
    FONT_SIZE_FLOATING,
    FONT_SIZE_DRAGGING,
    SLOT_SIZE,
    MAX_VELOCITY,
    MIN_VELOCITY,
    FONT_SIZE_SLOTTED,
    COLLISION_RESTITUTION,
    PHYSICS_MAX_DELTA_MS,
    PHYSICS_MIN_DELTA_MS,
} from "../constants/constants";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from '../../../redux/store/Store';
import { showToast } from '../../custom-toast/ToastRef';
import { RootState } from '../../../redux/store/RootReducer';
import { getFontScale } from '../utils/getFontScale';
import { dropWordToSlotCardInSlotSound, onStartDragWordToSlotCardSound } from '../../../utils/sound/SoundFunctions';
import { vibrate } from '../../../utils/vibrationManager';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

interface Card {
  id: string;
  word: string;
  homePosition: Position;
  position: SharedValue<Position>;
  velocity: SharedValue<Velocity>;
  isDragging: SharedValue<boolean>;
  dragZIndex: SharedValue<number>;
  isAssigned: SharedValue<boolean>;
  cardSize: SharedValue<number>;
  fontSize: SharedValue<number>;
}

// ============================================================================
// معماری Context: به‌جای یک Context بزرگ که هر تغییری (حتی جابه‌جایی یک کارت)
// باعث رندر مجدد همه‌ی FloatingCard/DropZone/TopHeader می‌شد، سه Context جدا با
// نرخ تغییر متفاوت داریم:
//
// 1) DragDropRegistryContext  -> فقط getSlotOfCard/getSlotPosition. این دو تابع
//    باید هنگام هر برخورد/جابه‌جایی کارت به‌روز شوند و از UI thread (worklet) هم
//    صدا زده می‌شوند، پس هویت‌شان لزوماً با هر جابه‌جایی عوض می‌شود. فقط FloatingCard
//    به این‌ها نیاز دارد، پس فقط FloatingCard مشترک این Context است.
// 2) DragDropContext (اصلی)  -> بقیه‌ی مقادیر/توابع که دیگر با ref پایدار شده‌اند
//    و فقط در رویدادهای کم‌تکرار (تغییر پارت و...) عوض می‌شوند. FloatingCard,
//    DropZone, TopHeader از این استفاده می‌کنند.
// 3) SlotsStateContext       -> فقط cards/slots، که فقط SentenceDisplay برای
//    ساختن جمله و بررسی صحت آن لازم دارد.
// ============================================================================

interface RegistryContextProps {
  getSlotPosition: (index: number) => Position | undefined;
  getSlotOfCard: (cardId: string) => number | null;
}

interface ContextProps {
  registerCard: (card: Card) => void;
  assignCardToSlot: (cardId: string, slotIndex: number, fromSlot: number | null) => void;
  unassignCardFromSlot: (slotIndex: any) => void;
  registerSlot: (index: number, pos: Position) => void;
  currentWords: any[];
  completeCurrentPart: () => void;
  changePlayingIndex: (index: number) => void;
  currentPartIndex: number;
  playingPartIndex: number;
  completedSentences: string[];
  numberOfCards: number;
  existUnknownWord: boolean;
  numberParts: number;
  lockedPan: boolean;
  type: string;
  stageId: string;
  applyForHelp: () => void;
  sentenceHint?: string | null;
  timeLimitData?: any
  onClickUnknownWord: (wordId:any) => void;
  gameTimeIsOver?: () => void;
  completed: SharedValue<boolean>;
}

interface SlotsStateContextProps {
  cards: Record<string, Card>;
  slots: Record<number, string>;
}

// همان تنظیمات springای که در FloatingCard.tsx برای درگ واقعی استفاده می‌شود؛ این‌جا هم
// عیناً استفاده می‌شوند تا انیمیشن «راهنما» دقیقاً همان حس‌وحال درگ‌ودراپ دستی را بدهد.
const HELP_PICKUP_SPRING = { stiffness: 200, damping: 16, mass: 1.4, overshootClamping: false }; // فاز اول: برداشتن/بزرگ‌شدن کارت
const HELP_DROP_SPRING = { stiffness: 200, damping: 16, mass: 1.4, overshootClamping: false }; // فاز دوم: نشستن در اسلات/کوچک‌شدن

const DragDropRegistryContext = createContext<RegistryContextProps>({} as RegistryContextProps);
const DragDropContext = createContext<ContextProps>({} as ContextProps);
const SlotsStateContext = createContext<SlotsStateContextProps>({} as SlotsStateContextProps);

export const DragDropProvider: React.FC<{
  children: React.ReactNode;
  stageId: string;
  type: string;
  data: any;
  saveWordHelpUsed:(partIndex:number, wordId:any)=>void;
  saveCompletedPartAndSentenceBuilded:(partIndex:number)=>void;
  endOfAStage:()=>void;
  onPressUnknownWord:(partIndex:number, wordId:any)=>void;
  gameTimeIsOver?:()=>void;
}> = ({
  children,
  stageId,
  type,
  data,
  saveWordHelpUsed,
  saveCompletedPartAndSentenceBuilded,
  endOfAStage,
  onPressUnknownWord,
  gameTimeIsOver
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wordToSlotGuide, unknownWordGuide } = useSelector((state: RootState) => state.setting);

  let stageNumber: number | undefined;
  let timeLimitData: any;
  if(type === "stage-game"){
    stageNumber = data.stage_number_in_language;
  } else if(type === "package-game"){
    stageNumber = data.stage_number_in_package;
  }
  if (type === "harf-akhar" && data){
    if(data?.time_limit){
      timeLimitData = {
        time_limit: data?.time_limit,
        remaining_time_seconds: data?.remaining_time_seconds,
        remaining_synced_at: data?.remaining_synced_at
      }
    }
  }

  const parts = data?.parts
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [slotPositions, setSlotPositions] = useState<Record<number, Position>>({});
  const [cardSlotMap, setCardSlotMap] = useState<Record<string, number>>({});
  const [currentPartIndex, setCurrentPartIndex] = useState(Math.max(0, parts.findIndex((item:any) => item.sentence_builded !== true)));
  const [playingPartIndex, setPlayingPartIndex] = useState(Math.max(0, parts.findIndex((item:any) => item.sentence_builded !== true)))
  const [completedSentences, setCompletedSentences] = useState<string[]>(
    () => parts.filter((p:any) => p.sentence_builded).map((p:any) => p?.sentence_display??p.sentence)
  );
  const [lockedPan, setLockedPan] = useState<boolean>(false)
  const completed = useSharedValue(false);
  const numberParts = parts.length
  const sentenceHint = parts[playingPartIndex]?.sentence_hint

  // کلماتی که همین الان (در همین session، مستقل از تأخیر رفت‌وبرگشت دیتابیس) برایشان
  // راهنما درخواست شده‌اند. چون word_help_used در props تا پایان انیمیشن + ذخیره‌سازی
  // آپدیت نمی‌شود، applyForHelp بدون این ref با چند تپ سریع همیشه یک کلمه را پیدا می‌کرد.
  const helpRequestedIndexesRef = useRef<Set<number>>(new Set());

  // --------------------------------------------------------------------
  // ref هایی که همیشه هم‌زمان با state آپدیت می‌شوند (نه با یک تیک تأخیر مثل
  // useEffect). این ref ها فقط از JS thread خوانده می‌شوند (نه از worklet روی
  // UI thread)، پس امن هستند. هدف: توابعی مثل assignCardToSlot/unassignCardFromSlot
  // بتوانند همیشه به آخرین مقدار دسترسی داشته باشند بدون این‌که هویت‌شان
  // (identity) با هر تغییر state عوض شود؛ همین یعنی Context اصلی دیگر با هر
  // جابه‌جایی کارت رفرنس تازه نمی‌گیرد و FloatingCard/DropZone/TopHeader
  // بی‌دلیل رندر نمی‌شوند.
  // --------------------------------------------------------------------
  const cardsRef = useRef<Record<string, Card>>({});
  const slotsRef = useRef<Record<number, string>>({});
  const cardSlotMapRef = useRef<Record<string, number>>({});

  type Updater<T> = T | ((prev: T) => T);

  const onClickUnknownWord = useCallback((wordId:any)=> {
    const partIndex = playingPartIndex
    onPressUnknownWord(partIndex, wordId)
  }, [playingPartIndex, onPressUnknownWord])

  const setCardsSynced = useCallback((value: Updater<Record<string, Card>>) => {
    const next = typeof value === 'function'
      ? (value as (p: Record<string, Card>) => Record<string, Card>)(cardsRef.current)
      : value;
    cardsRef.current = next; // آپدیت فوری، نه داخل callback تأخیری setState
    setCards(next);
  }, []);

  const setSlotsSynced = useCallback((value: Updater<Record<number, string>>) => {
    const next = typeof value === 'function'
      ? (value as (p: Record<number, string>) => Record<number, string>)(slotsRef.current)
      : value;
    slotsRef.current = next;
    setSlots(next);
  }, []);

  const setCardSlotMapSynced = useCallback((value: Updater<Record<string, number>>) => {
    const next = typeof value === 'function'
      ? (value as (p: Record<string, number>) => Record<string, number>)(cardSlotMapRef.current)
      : value;
    cardSlotMapRef.current = next;
    setCardSlotMap(next);
  }, []);

  // useMemo با وابستگی درست (parts, playingPartIndex) باعث می‌شود این آرایه فقط وقتی
  // واقعاً کلمات پارت جاری عوض می‌شوند از نو ساخته شود، نه در هر رندر (مثلاً هر بار که یک
  // کارت جابه‌جا می‌شود). قبلاً این آرایه در هر رندر از نو ساخته می‌شد که باعث می‌شد
  // useMemo داخل FloatingCardList/DropZoneList عملاً همیشه باطل شود و کل لیست کارت‌ها/اسلات‌ها
  // بی‌دلیل دوباره محاسبه شوند.
  const currentWords = useMemo(() => {
    return parts[playingPartIndex]?.words.map((w: any) => ({
      _id: w._id,
      word: w.word,
      unknown_word: w.unknown_word,
      unknown_word_completed: w.unknown_word_completed,
      word_help_used: w.word_help_used
    })) || [];
  }, [parts, playingPartIndex]);

  const numberOfCards = currentWords.length;
  const existUnknownWord = currentWords.some(
    (w:any) => w.unknown_word === true && w.unknown_word_completed === false
  );

  const completeCurrentPart = useCallback(() => {
    if(playingPartIndex == currentPartIndex){
      const currentSentence = parts[playingPartIndex]?.sentence_display??parts[playingPartIndex].sentence;
      setCompletedSentences(prev => {
        if (!prev.includes(currentSentence)) {
          const items = [...prev, currentSentence]
          return items;
        }
        return prev;
      });
    }
    setLockedPan(true)
    const partIndex = playingPartIndex
    saveCompletedPartAndSentenceBuilded(partIndex)
    if (playingPartIndex < parts.length - 1) {
      setTimeout(()=>{
        if(currentPartIndex == playingPartIndex){
          setCurrentPartIndex(prev => prev + 1);
          setPlayingPartIndex(prev => prev + 1)
        } else {
          setPlayingPartIndex(prev => prev + 1)
        }
        setSlotsSynced({})
        setCardsSynced({})
        // setSlotPositions({})
        setCardSlotMapSynced({})
        setLockedPan(false)
      }, 1500)
    } else {
      completed.value = true
      setTimeout(async()=>{
        setSlotsSynced({})
        setLockedPan(false)
        endOfAStage()
      }, 1500)
    }
    helpRequestedIndexesRef.current.clear()
  }, [currentPartIndex, playingPartIndex, parts, setSlotsSynced, setCardsSynced, setCardSlotMapSynced]);

  const changePlayingIndex = useCallback((index: number) => {
    setPlayingPartIndex(index)
    setSlotsSynced({})
    setCardsSynced({})
    // setSlotPositions({})
    setCardSlotMapSynced({})
    setLockedPan(true)
    setTimeout(()=>{
      setLockedPan(false)
    }, 2000)
    helpRequestedIndexesRef.current.clear()
  }, [setSlotsSynced, setCardsSynced, setCardSlotMapSynced]);

  // این دو تابع هم از JS thread (رویدادهای React) و هم از UI thread (worklet های
  // ژست/فیزیک) صدا زده می‌شوند، پس باید همچنان از روی state (نه ref) بسته شوند تا
  // Reanimated بتواند نسخه‌ی تازه را به UI thread هم برساند. به همین دلیل هویت‌شان
  // با تغییر cardSlotMap/slotPositions عوض می‌شود؛ همین‌هاست که در Context جدا
  // (DragDropRegistryContext) قرار گرفته‌اند تا فقط FloatingCard از تغییرشان تأثیر بگیرد.
  const getSlotOfCard = useCallback(
    (cardId: string) => {
      'worklet';
      return cardSlotMap[cardId] ?? null;
    },
    [cardSlotMap]
  );

  const getSlotPosition = useCallback(
    (index: number) => {
      'worklet';
      return slotPositions[index];
    },
    [slotPositions]
  );

  // فقط از JS thread صدا زده می‌شود (داخل registerCard، هنگام mount شدن کارت‌ها)،
  // پس امن است که از ref بخواند و هویتش برای همیشه ثابت بماند.
  const isOverlapping = useCallback(
    (newPos: Position, cardId: string) => {
      const currentCards = cardsRef.current;
      const currentCardSlotMap = cardSlotMapRef.current;
      for (const otherCardId in currentCards) {
        if (otherCardId === cardId || currentCardSlotMap[otherCardId] != null) continue;
        const otherPos = currentCards[otherCardId].position.value;
        if (!otherPos) continue;
        const dx = newPos.x + (CARD_SIZE_FLOATING*1.3) / 2 - (otherPos.x + (CARD_SIZE_FLOATING*1.3) / 2);
        const dy = newPos.y + CARD_SIZE_FLOATING / 2 - (otherPos.y + CARD_SIZE_FLOATING / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CARD_SIZE_FLOATING) return true;
      }
      return false;
    },
    []
  );

  const registerCard = useCallback(
    (card: Card) => {
      if (cardsRef.current[card.id]) return;
      setCardsSynced(prev => ({ ...prev, [card.id]: card }));

      let newPos = card.homePosition;
      let attempts = 0;
      while (isOverlapping(newPos, card.id) && attempts < 100) {
        newPos = {
          x: Math.random() * (BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3)),
          y: Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
        };
        attempts++;
      }
      card.position.value = newPos;
      card.velocity.value = {
        vx: (Math.random() - 0.5) * MAX_VELOCITY,
        vy: (Math.random() - 0.5) * MAX_VELOCITY,
      };
    },
    [isOverlapping, setCardsSynced]
  );

  const registerSlot = useCallback((index: number, pos: Position) => {
      setSlotPositions(prev => {
        return { ...prev, [index]: pos };
      });
    }, []);

  // فقط از JS thread صدا زده می‌شود (از طریق runOnJS)، پس از ref می‌خواند.
  const unassignCardFromSlot = useCallback((slotIndex: number) => {
      const cardId = cardSlotMapRef.current[slotIndex] || slotsRef.current[slotIndex];
      if (!cardId) return;
      setSlotsSynced(prev => {
        const newSlots = { ...prev };
        delete newSlots[slotIndex];
        return newSlots;
      });
      setCardSlotMapSynced(prev => {
        const newMap = { ...prev };
        delete newMap[cardId];
        return newMap;
      });
    }, [setSlotsSynced, setCardSlotMapSynced]);

  // همین‌طور فقط از JS thread صدا زده می‌شود (از طریق runOnJS)، پس از ref می‌خواند.
  const assignCardToSlot = useCallback(
    (cardId: string, slotIndex: number, fromSlot: number | null) => {
      const currentCards = cardsRef.current;
      const currentSlots = slotsRef.current;
      const currentCardSlotMap = cardSlotMapRef.current;

      const occupyingCardId = currentSlots[slotIndex] ?? null;
      const newSlots = { ...currentSlots };
      const newCardSlotMap = { ...currentCardSlotMap };

      if (occupyingCardId && occupyingCardId !== cardId) {
        const occupyingCard = currentCards[occupyingCardId];
        const fromUpperZone = fromSlot === null;

        if (fromUpperZone) {
          // قانون A: کارت از منطقه بالایی آمده است
          unassignCardFromSlot(slotIndex); // صراحتاً کارت قبلی را حذف کن
          const fontSizeScale = getFontScale(occupyingCard.word)
          const FONT_SIZE_FLOATING_SCALED = FONT_SIZE_FLOATING * fontSizeScale;
          occupyingCard.isAssigned.value = false;
          occupyingCard.position.value = withSpring(
            { x: occupyingCard.homePosition.x, y: occupyingCard.homePosition.y },
            { stiffness: 180, damping: 18 }
          );
          occupyingCard.velocity.value = {
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
          };
          delete newSlots[slotIndex];
          delete newCardSlotMap[occupyingCardId];
          occupyingCard.cardSize.value = withSpring(
            CARD_SIZE_FLOATING,
            { stiffness: 180, damping: 18 }
          );
          occupyingCard.fontSize.value = withSpring(
            FONT_SIZE_FLOATING_SCALED,
            { stiffness: 180, damping: 18 }
          );
        } else {
          // قانون B: کارت از یک اسلات دیگر آمده است
          const posToReturn = getSlotPosition(fromSlot);
          if (posToReturn) {
            // انتقال کارت موجود به اسلات مبدا
            occupyingCard.position.value = withSpring(
              {
                x: posToReturn.x - (CARD_SIZE_SLOTTED + SLOT_SIZE*1.3) / 4 - BOUNDARY_HORIZONTAL_OFFSET,
                y: posToReturn.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 + 2,
              },
              { stiffness: 200, damping: 18 }
            );
            occupyingCard.isAssigned.value = true;
            newSlots[fromSlot] = occupyingCardId;
            newCardSlotMap[occupyingCardId] = fromSlot;
          }
        }
      } else if (fromSlot !== null) {
        // اگر کارت از اسلات دیگری آمده و اسلات مقصد خالی است، اسلات مبدا را آزاد کن
        delete newSlots[fromSlot];
        delete newCardSlotMap[cardId];
      }

      newSlots[slotIndex] = cardId;
      newCardSlotMap[cardId] = slotIndex;

      // تخصیص کارت جدید به اسلات مقصد
      const fontSizeScale = getFontScale(currentCards[cardId].word);
      const FONT_SIZE_SLOTTED_SCALED = FONT_SIZE_SLOTTED * fontSizeScale;
      const target = getSlotPosition(slotIndex);
      if (target) {
        currentCards[cardId].position.value = withSpring(
          {
            x: target.x - (CARD_SIZE_SLOTTED + SLOT_SIZE*1.3) / 4 - BOUNDARY_HORIZONTAL_OFFSET,
            y: target.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 + 2,
          },
          { stiffness: 200, damping: 18 }
        );
        currentCards[cardId].isAssigned.value = true;
        currentCards[cardId].cardSize.value = withSpring(
          CARD_SIZE_SLOTTED,
          { stiffness: 180, damping: 18 }
        );
        currentCards[cardId].fontSize.value = withSpring(
          FONT_SIZE_SLOTTED_SCALED,
          { stiffness: 180, damping: 18 }
        );
      }

      // به‌روزرسانی state فقط یک بار در انتها
      setSlotsSynced(prev => ({ ...prev, ...newSlots }));
      setCardSlotMapSynced(prev => ({ ...prev, ...newCardSlotMap }));
    },
    [getSlotPosition, unassignCardFromSlot, setSlotsSynced, setCardSlotMapSynced]
  );


  // این تابع دقیقاً لحظه‌ی «نشستن واقعی» کارت روی اسلات صدا زده می‌شود (نه لحظه‌ی کلیک).
  // چون prev همیشه جدیدترین state واقعی در آن لحظه است (نه یک snapshot قدیمی از لحظه‌ی
  // کلیک)، چند فراخوانی هم‌زمان/سریع دیگر همدیگر را overwrite نمی‌کنند - هرکدام فقط
  // کلیدهای خودش را روی جدیدترین نسخه پچ می‌زند.
  const commitHelpSlotAssignment = useCallback((
    cardId: string,
    slotIndex: number,
    vacatedSlot: number | null,
    kickedCardId: string | null
  ) => {
    setSlotsSynced(prev => {
      const next = { ...prev };
      // فقط اگر اسلات مبدا هنوز واقعاً متعلق به همین کارت است آزادش کن. اگر در همین فاصله
      // (بین شروع و پایان این انیمیشن) یک reveal دیگر چیز دیگری آن‌جا گذاشته، این حذف
      // دیگر معتبر نیست و نباید انجام شود - وگرنه دقیقاً همین جاست که کارت تازه‌نشسته
      // بی‌دلیل پاک می‌شود.
      if (vacatedSlot != null && vacatedSlot !== slotIndex && next[vacatedSlot] === cardId) {
        delete next[vacatedSlot];
      }
      next[slotIndex] = cardId;
      return next;
    });
    setCardSlotMapSynced(prev => {
      const next = { ...prev };
      // همین‌طور فقط اگر کارت کنارگذاشته‌شده هنوز واقعاً روی همان اسلاتی نشسته که فکر
      // می‌کردیم حذفش کن. اگر خودش (با reveal یا درگ خودش) در همین فاصله جای دیگری رفته،
      // این حذف دیگر معتبر نیست و نباید مپینگ تازه‌اش پاک شود.
      if (kickedCardId && kickedCardId !== cardId && next[kickedCardId] === slotIndex) {
        delete next[kickedCardId];
      }
      next[cardId] = slotIndex;
      return next;
    });
  }, [setSlotsSynced, setCardSlotMapSynced]);


  // ------------------------------------------------------------------------
  // انیمیشن دکمه‌ی «راهنما»: کارت مربوط به کلمه را - از هر کجا که هست (فضای شناور یا
  // یک اسلات اشتباه) - دقیقاً با همان حس‌وحال یک درگ‌ودراپ واقعی (بزرگ‌شدن هنگام
  // «برداشتن»، حرکت، و کوچک‌شدن هنگام «نشستن») به اسلات درست منتقل می‌کند.
  // اگر کارت دیگری در اسلات مقصد نشسته باشد، به فضای شناور برمی‌گردد (بدون افکت
  // برداشتن، چون این کارت پرتاب/کنارگذاشته می‌شود نه هدفِ کاربر).
  // فقط از JS thread صدا زده می‌شود (از applyForHelp)، پس امن است که از ref بخواند.
  // ------------------------------------------------------------------------
  const revealCardWithHelp = useCallback((cardId: string, slotIndex: number, partIndex:number, wordId:any) => {
    const currentCards = cardsRef.current;
    const currentSlots = slotsRef.current;
    const currentCardSlotMap = cardSlotMapRef.current;

    const card = currentCards[cardId];
    if (!card) return;

    const target = getSlotPosition(slotIndex);
    if (!target) return;
    
    // نکته‌ی مهم: دیگر یک snapshot کامل از slots/cardSlotMap نمی‌سازیم که ۱ ثانیه بعد
    // به‌عنوان جایگزین کامل state استفاده شود (این باعث lost-update بین دو کمک هم‌زمان
    // می‌شد). فقط دو مقدار ساده را نگه می‌داریم تا در لحظه‌ی commit (پایان انیمیشن) روی
    // جدیدترین state واقعی اعمال شوند.
    const cardCurrentSlot = currentCardSlotMap[cardId] ?? null;
    const occupyingCardId = currentSlots[slotIndex] ?? null;

    if (occupyingCardId && occupyingCardId !== cardId) {
      const occupyingCard = currentCards[occupyingCardId];
      if (occupyingCard) {
        const occupyingFontScale = getFontScale(occupyingCard.word);
        occupyingCard.isDragging.value = false;
        occupyingCard.isAssigned.value = false;
        occupyingCard.position.value = withSpring(
          { x: occupyingCard.homePosition.x, y: occupyingCard.homePosition.y },
          { stiffness: 180, damping: 18 }
        );
        occupyingCard.velocity.value = {
          vx: (Math.random() - 0.5) * 200,
          vy: (Math.random() - 0.5) * 200,
        };
        occupyingCard.cardSize.value = withSpring(CARD_SIZE_FLOATING, { stiffness: 180, damping: 18 });
        occupyingCard.fontSize.value = withSpring(
          FONT_SIZE_FLOATING * occupyingFontScale,
          { stiffness: 180, damping: 18 }
        );
      }
    }

    const fontScale = getFontScale(card.word);
    const FONT_SIZE_DRAGGING_SCALED = FONT_SIZE_DRAGGING * fontScale;
    const FONT_SIZE_SLOTTED_SCALED = FONT_SIZE_SLOTTED * fontScale;

    const currentSize = card.cardSize.value;
    const currentPos = card.position.value;

    const pickupPos = {
      x: currentPos.x - ((CARD_SIZE_DRAGGING * 1.3) - (currentSize * 1.3)) / 2,
      y: currentPos.y - (CARD_SIZE_DRAGGING - currentSize) / 2,
    };

    const hoverAboveSlotPos = {
      x: target.x - (CARD_SIZE_DRAGGING * 1.3 + SLOT_SIZE * 1.3) / 4 - BOUNDARY_HORIZONTAL_OFFSET,
      y: target.y - (CARD_SIZE_DRAGGING + SLOT_SIZE) / 4 + 2,
    };

    const finalPos = {
      x: target.x - (CARD_SIZE_SLOTTED + SLOT_SIZE * 1.3) / 4 - BOUNDARY_HORIZONTAL_OFFSET,
      y: target.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 + 2,
    };

    const HELP_TRAVEL_SPRING = { stiffness: 70, damping: 20, mass: 1.3, overshootClamping: true };

    runOnJS(onStartDragWordToSlotCardSound)();
    runOnJS(vibrate)();
    card.velocity.value = { vx: 0, vy: 0 };
    card.isDragging.value = true;
    card.dragZIndex.value = 99999;
    card.isAssigned.value = true;

    card.position.value = withSpring(pickupPos, HELP_PICKUP_SPRING, (finished1) => {
      'worklet';
      if (!finished1) return;
      card.position.value = withSpring(hoverAboveSlotPos, HELP_TRAVEL_SPRING, (finished2) => {
        'worklet';
        if (!finished2) return;
        card.position.value = withSpring(finalPos, HELP_DROP_SPRING, (finished3) => {
          'worklet';
          if (finished3) {
            card.isDragging.value = false;
            card.dragZIndex.value = 1;
            runOnJS(dropWordToSlotCardInSlotSound)();
            runOnJS(saveWordHelpUsed)(partIndex, wordId);
            // پچ جزئی روی جدیدترین state، نه جایگزینی کامل با snapshot قدیمی
            runOnJS(commitHelpSlotAssignment)(cardId, slotIndex, cardCurrentSlot, occupyingCardId);
          }
        });
        card.cardSize.value = withSpring(CARD_SIZE_SLOTTED, HELP_DROP_SPRING);
        card.fontSize.value = withSpring(FONT_SIZE_SLOTTED_SCALED, HELP_DROP_SPRING);
      });
    });
    card.cardSize.value = withSpring(CARD_SIZE_DRAGGING, HELP_PICKUP_SPRING);
    card.fontSize.value = withSpring(FONT_SIZE_DRAGGING_SCALED, HELP_PICKUP_SPRING);
  }, [getSlotPosition, commitHelpSlotAssignment]);

  const applyForHelp = useCallback(() => {
    for (let index = 0; index < currentWords.length; index++) {
      const element = currentWords[index];
      const alreadyHandled = element.word_help_used == true || helpRequestedIndexesRef.current.has(index);

      if (alreadyHandled) {
        if (index == currentWords.length - 1) {
          showToast({
              title: "راهنما یافت نشد",
              message: "آیتمی برای راهنمایی موجود نیست!",
              type: "error",
              animationType: "slide",
              position: "top",
          });
          return false
        }
        continue
      } else {
        // claim فوری و همزمان - قبل از هرگونه انیمیشن/async - تا تپ بعدی حتی یک میکروثانیه
        // بعد، سراغ کلمه‌ی بعدی برود نه همین یکی
        helpRequestedIndexesRef.current.add(index);

        const wordId = element._id
        const partIndex = playingPartIndex
        if (!element.unknown_word || (element.unknown_word && element.unknown_word_completed)) {
          const cardId = `${element.word}_${index}`;
          revealCardWithHelp(cardId, index, partIndex, wordId);
        } else {
          saveWordHelpUsed(partIndex, wordId)
        }
        return true;
      }
    }
  }, [currentWords, playingPartIndex, saveWordHelpUsed, revealCardWithHelp]);

  const frameCallback = useFrameCallback((frameInfo) => {
    'worklet';

    // ===== ثابت‌های حرکت مستقل از فریم‌ریت =====
    const rawDtMs = frameInfo.timeSincePreviousFrame ?? 16.667;
    const dtMs = Math.min(Math.max(rawDtMs, PHYSICS_MIN_DELTA_MS), PHYSICS_MAX_DELTA_MS);
    const dt = dtMs / 1000; // ثانیه

    const allCardIds = Object.keys(cards);

    const floatingCardIds = allCardIds.filter(id => {
      const card = cards[id];
      return card && !card.isDragging.value && !card.isAssigned.value;
    });

    const numCards = floatingCardIds.length;

    for (let i = 0; i < numCards; i++) {
      const cardId = floatingCardIds[i];
      const card = cards[cardId];

      const pos = card.position.value;
      const velocity = card.velocity.value;

      if (isNaN(pos.x) || isNaN(pos.y) || isNaN(velocity.vx) || isNaN(velocity.vy)) {
        continue;
      }

      const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
      let vx = velocity.vx;
      let vy = velocity.vy;
      if (speed > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / speed;
        vx *= scale;
        vy *= scale;
      } else if (speed < MIN_VELOCITY && speed > 0) {
        const scale = MIN_VELOCITY / speed;
        vx *= scale;
        vy *= scale;
      }

      let newX = pos.x + vx * dt;
      let newY = pos.y + vy * dt;

      if (newX < 0) {
        newX = 0;
        vx *= -1;
      } else if (newX > BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3)) {
        newX = BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3);
        vx *= -1;
      }
      if (newY < 0) {
        newY = 0;
        vy *= -1;
      } else if (newY > BOUNDARY_HEIGHT - CARD_SIZE_FLOATING) {
        newY = BOUNDARY_HEIGHT - CARD_SIZE_FLOATING;
        vy *= -1;
      }

      // نکته‌ی مهم: اینجا عمداً یک آبجکت جدید ساخته می‌شود. SharedValue های Reanimated
      // تغییر را با مقایسه‌ی رفرنس تشخیص می‌دهند؛ اگر همان رفرنس قبلی (فقط با فیلدهای
      // تغییریافته) دوباره ست شود، Reanimated «تغییری» نمی‌بیند و listener ها (از جمله
      // useAnimatedStyle که رندر کارت را می‌سازد) صدا زده نمی‌شوند.
      card.position.value = { x: newX, y: newY };
      card.velocity.value = { vx, vy };
    }

    if (numCards < 2) {
        return;
    }

    for (let i = 0; i < numCards; i++) {
      const cardA = cards[floatingCardIds[i]];

      for (let j = i + 1; j < numCards; j++) {
        const cardB = cards[floatingCardIds[j]];

        const posA = cardA.position.value;
        const velA = cardA.velocity.value;
        const posB = cardB.position.value;
        const velB = cardB.velocity.value;

        const rectA = { left: posA.x, right: posA.x + (CARD_SIZE_FLOATING*1.3), top: posA.y, bottom: posA.y + CARD_SIZE_FLOATING };
        const rectB = { left: posB.x, right: posB.x + (CARD_SIZE_FLOATING*1.3), top: posB.y, bottom: posB.y + CARD_SIZE_FLOATING };

        const isColliding =
          rectA.left < rectB.right &&
          rectA.right > rectB.left &&
          rectA.top < rectB.bottom &&
          rectA.bottom > rectB.top;

        if (isColliding) {
          const overlapX = Math.min(rectA.right - rectB.left, rectB.right - rectA.left);
          const overlapY = Math.min(rectA.bottom - rectB.top, rectB.bottom - rectA.top);

          let dx = 0;
          let dy = 0;
          if (overlapX < overlapY) {
            dx = rectA.left < rectB.left ? -(overlapX / 2) : overlapX / 2;
          } else {
            dy = rectA.top < rectB.top ? -(overlapY / 2) : overlapY / 2;
          }

          const newPosAx = posA.x + dx;
          const newPosAy = posA.y + dy;
          const newPosBx = posB.x - dx;
          const newPosBy = posB.y - dy;

          const collisionNormalX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
          const collisionNormalY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

          const relativeVx = velA.vx - velB.vx;
          const relativeVy = velA.vy - velB.vy;
          const dotProduct = relativeVx * collisionNormalX + relativeVy * collisionNormalY;

          let newVelAx = velA.vx;
          let newVelAy = velA.vy;
          let newVelBx = velB.vx;
          let newVelBy = velB.vy;

          if (dotProduct < 0) {
            // ضریب COLLISION_RESTITUTION باعث می‌شود هر برخورد کمی انرژی از دست بدهد،
            // و کارت‌های گیرکرده در گوشه/بین چند کارت دیگر به‌جای لرزش پیوسته، آرام باز شوند
            const impulse = dotProduct * COLLISION_RESTITUTION;
            newVelAx -= impulse * collisionNormalX;
            newVelAy -= impulse * collisionNormalY;
            newVelBx += impulse * collisionNormalX;
            newVelBy += impulse * collisionNormalY;
          }

          cardA.position.value = { x: newPosAx, y: newPosAy };
          cardB.position.value = { x: newPosBx, y: newPosBy };
          cardA.velocity.value = { vx: newVelAx, vy: newVelAy };
          cardB.velocity.value = { vx: newVelBx, vy: newVelBy };
        }
      }
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(true);
    return () => {
      frameCallback.setActive(false);
    };
  }, [frameCallback]);

  useEffect(() => {
    checkShowGuide()
  }, [])
  const checkShowGuide = async()=>{
    if(wordToSlotGuide == false && stageNumber == 1){
      const { showWordToSlotGuide } = await import('../../../utils/functions/Guide');
      setTimeout(()=>{
        const sentence = parts[playingPartIndex]?.sentence_display??parts[playingPartIndex].sentence;
        showWordToSlotGuide({dispatch, currentWords, sentence})
      }, 2000)
    } else if(unknownWordGuide == false && existUnknownWord == true && stageNumber && stageNumber < 5){
      const { showUnknownWordGuide } = await import('../../../utils/functions/Guide');
      setTimeout(()=>{
        showUnknownWordGuide({dispatch})
      }, 2000)
    }
  }

  const registryValue = useMemo<RegistryContextProps>(() => ({
    getSlotPosition,
    getSlotOfCard,
  }), [getSlotPosition, getSlotOfCard]);

  const mainValue = useMemo<ContextProps>(() => ({
    registerCard,
    assignCardToSlot,
    unassignCardFromSlot,
    registerSlot,
    currentWords,
    completeCurrentPart,
    changePlayingIndex,
    currentPartIndex,
    playingPartIndex,
    completedSentences,
    numberOfCards,
    existUnknownWord,
    numberParts,
    lockedPan,
    type,
    stageId,
    applyForHelp,
    sentenceHint,
    timeLimitData,
    onClickUnknownWord,
    gameTimeIsOver,
    completed
  }), [
    registerCard,
    assignCardToSlot,
    unassignCardFromSlot,
    registerSlot,
    currentWords,
    completeCurrentPart,
    changePlayingIndex,
    currentPartIndex,
    playingPartIndex,
    completedSentences,
    numberOfCards,
    existUnknownWord,
    numberParts,
    lockedPan,
    type,
    stageId,
    applyForHelp,
    sentenceHint,
    timeLimitData,
    onClickUnknownWord,
    gameTimeIsOver,
    completed
  ]);

  const slotsStateValue = useMemo<SlotsStateContextProps>(() => ({
    cards,
    slots,
  }), [cards, slots]);

  return (
    <DragDropContext.Provider value={mainValue}>
      <DragDropRegistryContext.Provider value={registryValue}>
        <SlotsStateContext.Provider value={slotsStateValue}>
          {children}
        </SlotsStateContext.Provider>
      </DragDropRegistryContext.Provider>
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => useContext(DragDropContext);
export const useDragDropRegistry = () => useContext(DragDropRegistryContext);
export const useSlotsState = () => useContext(SlotsStateContext);
