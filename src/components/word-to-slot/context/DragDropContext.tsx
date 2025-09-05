import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useFrameCallback, withSpring, SharedValue } from 'react-native-reanimated';
import {
    BOUNDARY_TOP_OFFSET,
    BOUNDARY_HORIZONTAL_OFFSET,
    BOUNDARY_WIDTH,
    BOUNDARY_HEIGHT,
    CARD_SIZE_FLOATING,
    CARD_SIZE_DRAGGING,
    CARD_SIZE_SLOTTED,
    FONT_SIZE_FLOATING,
    SLOT_SIZE,
    MAX_VELOCITY,
    MIN_VELOCITY,
    FONT_SIZE_SLOTTED,
} from "../constants/constants";
import Realm from 'realm';
import { endOfAStageInStageGame } from '../functions/StageGameFunctions';
import { useDispatch } from "react-redux";
import { AppDispatch } from '../../../redux/store/Store';
import { useRealm } from '../../../realm';
import { getStageById } from '../../../realm/repositories/stage-game/stage.repository';

import { useObject } from '../../../realm';
import { BSON } from 'realm';
import { Stage } from '../../../realm/schemas/stage-game/StageSchema';
import { saveCompletedPartAndSentenceBuilded, saveWordHelpUsedInStageGame } from '../../../realm/repositories/user/user-stage-game-progress.repository';
import Toast from 'react-native-toast-message';

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
  isAssigned: SharedValue<boolean>;
  cardSize: SharedValue<number>;
  fontSize: SharedValue<number>;
}

interface ContextProps {
  registerCard: (card: Card) => void;
  getSlotPosition: (index: number) => Position | undefined;
  assignCardToSlot: (cardId: string, slotIndex: number, fromSlot: number | null) => void;
  unassignCardFromSlot: (slotIndex: any) => void;
  getSlotOfCard: (cardId: string) => number | null;
  cards: Record<string, Card>;
  slots: Record<number, string>;
  registerSlot: (index: number, pos: Position) => void;
  currentWords: any[];
  completeCurrentPart: () => void;
  changePlayingIndex: (index: number) => void;
  currentPartIndex: number;
  playingPartIndex: number;
  completedSentences: string[];
  numberOfCards: number;
  numberParts: number;
  lockedPan: boolean;
  type: string;
  stageId: string;
  applyForHelp: () => void;
}

const DragDropContext = createContext<ContextProps>({} as ContextProps);

export const DragDropProvider: React.FC<{
  children: React.ReactNode;
  stageId: string;
  currentStageId: string;
  type: string;
}> = ({
  children,
  stageId,
  currentStageId,
  type,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const realm = useRealm();
  const objectId = typeof stageId === 'string' ? new BSON.ObjectId(stageId) : stageId;
  const data = type == "stage-game"&&useObject<Stage>('Stage', objectId);
  const stageNumber = (type == "stage-game" && data)?data?.stage_number_in_language:undefined
  const languageId = (type == "stage-game" && data)?data?.language_ref?.toString():undefined
  const parts = data?data?.parts:[]
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [slotPositions, setSlotPositions] = useState<Record<number, Position>>({});
  const [cardSlotMap, setCardSlotMap] = useState<Record<string, number>>({});
  const [currentPartIndex, setCurrentPartIndex] = useState(() => {
    const idx = parts.findIndex(item => item.sentence_builded !== true);
    return idx !== -1 ? idx : parts.length - 1;
  });
  const [playingPartIndex, setPlayingPartIndex] = useState(Math.max(0, parts.findIndex(item => item.sentence_builded !== true)))
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [lockedPan, setLockedPan] = useState<boolean>(false)
  const numberParts = parts.length


  const currentWords = parts[playingPartIndex]?.words.map((w: any) => ({
    _id: w._id,
    word: w.word,
    unknown_word: w.unknown_word,
    unknown_word_completed: w.unknown_word_completed,
    word_help_used: w.word_help_used
  })) || [];

  const numberOfCards = currentWords.length;

  function applyForHelp() {
    for (let index = 0; index < currentWords.length; index++) {
      const element = currentWords[index];
      if(element.word_help_used == true){
        if(index == currentWords.length - 1){
          Toast.show({
            type: "error",
            text1 : "آیتمی برای راهنمایی موجود نیست!",
            topOffset : 10
          })
          return false
        }
        continue
      } else {
        const partIndex = playingPartIndex
        const wordId = element._id
        if(type == "stage-game"){
          saveWordHelpUsedInStageGame( realm, stageId, partIndex, wordId);
          return true
        }
        break
      }
    }
  }

  const completeCurrentPart = useCallback(() => {
    let sentences:any
    if(playingPartIndex == currentPartIndex){
      const currentSentence = parts[playingPartIndex].sentence;
      setCompletedSentences(prev => {
        if (!prev.includes(currentSentence)) {
          sentences = [...prev, currentSentence]
          return sentences;
        }
        return prev;
      });
    }
    setLockedPan(true)
    if(type == "stage-game"){
      const partIndex = playingPartIndex
      saveCompletedPartAndSentenceBuilded( realm, stageId, partIndex);
    }
    if (playingPartIndex < parts.length - 1) {
      setTimeout(()=>{
        if(currentPartIndex == playingPartIndex){
          setCurrentPartIndex(prev => prev + 1);
          setPlayingPartIndex(prev => prev + 1)
        } else {
          setPlayingPartIndex(prev => prev + 1)
        }
        setSlots({})
        setCards({})
        // setSlotPositions({})
        setCardSlotMap({})
        setLockedPan(false)
      }, 1000)
    } else {
      setTimeout(()=>{
        setSlots({})
        setLockedPan(false)
        if(type == "stage-game"){
          const language_ref = languageId
          endOfAStageInStageGame({dispatch, realm, language_ref, stageId, currentStageId, stageNumber, sentences})
        } else if(type == "package-game"){
          
        }
      }, 1000)
    }
  }, [currentPartIndex, playingPartIndex, parts]);

  const changePlayingIndex = useCallback((index: number) => {
    setPlayingPartIndex(index)
    setSlots({})
    setCards({})
    // setSlotPositions({})
    setCardSlotMap({})
    setLockedPan(true)
    setTimeout(()=>{
      setLockedPan(false)
    }, 2000)
  }, [playingPartIndex]);

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

  const isOverlapping = useCallback(
    (newPos: Position, cardId: string) => {
      'worklet';
      for (const otherCardId in cards) {
        if (otherCardId === cardId || getSlotOfCard(otherCardId) !== null) continue;
        const otherPos = cards[otherCardId].position.value;
        if (!otherPos) continue;
        const dx = newPos.x + CARD_SIZE_FLOATING / 2 - (otherPos.x + CARD_SIZE_FLOATING / 2);
        const dy = newPos.y + CARD_SIZE_FLOATING / 2 - (otherPos.y + CARD_SIZE_FLOATING / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CARD_SIZE_FLOATING) return true;
      }
      return false;
    },
    [cards, getSlotOfCard]
  );

  const registerCard = useCallback(
    (card: Card) => {
      if (cards[card.id]) return;
      setCards(prev => ({ ...prev, [card.id]: card }));

      let newPos = card.homePosition;
      let attempts = 0;
      while (isOverlapping(newPos, card.id) && attempts < 100) {
        newPos = {
          x: Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING),
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
    [cards, isOverlapping]
  );

  const registerSlot = useCallback((index: number, pos: Position) => {
      setSlotPositions(prev => {
        return { ...prev, [index]: pos };
      });
    }, []);

  const unassignCardFromSlot = useCallback((slotIndex: number) => {
      const cardId = cardSlotMap[slotIndex] || slots[slotIndex];
      if (!cardId) return;
      setSlots(prev => {
        const newSlots = { ...prev };
        delete newSlots[slotIndex];
        return newSlots;
      });
      setCardSlotMap(prev => {
        const newMap = { ...prev };
        delete newMap[cardId];
        return newMap;
      });
    }, [cardSlotMap, slots]);

  const assignCardToSlot = useCallback(
  (cardId: string, slotIndex: number, fromSlot: number | null) => {
    const occupyingCardId = slots[slotIndex] ?? null;
    const newSlots = { ...slots };
    const newCardSlotMap = { ...cardSlotMap };

    if (occupyingCardId && occupyingCardId !== cardId) {
      const occupyingCard = cards[occupyingCardId];
      const fromUpperZone = fromSlot === null;

      if (fromUpperZone) {
        // قانون A: کارت از منطقه بالایی آمده است
        unassignCardFromSlot(slotIndex); // صراحتاً کارت قبلی را حذف کن
        const fontSizeScale = occupyingCard.word.length < 3 ? 1.6 : occupyingCard.word.length < 4 ? 1.5 : occupyingCard.word.length < 5 ? 1.4 : occupyingCard.word.length < 6 ? 1.3 : occupyingCard.word.length < 7 ? 1.2 : occupyingCard.word.length < 8 ? 1.1 : occupyingCard.word.length > 12 ? 0.9 : 1;
        const FONT_SIZE_FLOATING_SCALED = FONT_SIZE_FLOATING * fontSizeScale;
        occupyingCard.isAssigned.value = false;
        occupyingCard.position.value = withSpring(
          occupyingCard.homePosition,
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
              x: posToReturn.x - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 - BOUNDARY_HORIZONTAL_OFFSET,
              y: posToReturn.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4,
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

    // تخصیص کارت جدید به اسلات مقصد
    const fontSizeScale = cards[cardId].word.length < 3 ? 1.6 : cards[cardId].word.length < 4 ? 1.5 : cards[cardId].word.length < 5 ? 1.4 : cards[cardId].word.length < 6 ? 1.3 : cards[cardId].word.length < 7 ? 1.2 : cards[cardId].word.length < 8 ? 1.1 : cards[cardId].word.length > 12 ? 0.9 : 1;
    const FONT_SIZE_SLOTTED_SCALED = FONT_SIZE_SLOTTED * fontSizeScale;
    const target = getSlotPosition(slotIndex);
    if (target) {
      cards[cardId].position.value = withSpring(
        {
          x: target.x - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 - BOUNDARY_HORIZONTAL_OFFSET,
          y: target.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4,
        },
        { stiffness: 200, damping: 18 }
      );
      cards[cardId].isAssigned.value = true;
      cards[cardId].cardSize.value = withSpring(
        CARD_SIZE_SLOTTED,
        { stiffness: 180, damping: 18 }
      );
      cards[cardId].fontSize.value = withSpring(
        FONT_SIZE_SLOTTED_SCALED,
        { stiffness: 180, damping: 18 }
      );
    }

    newSlots[slotIndex] = cardId;
    newCardSlotMap[cardId] = slotIndex;

    // به‌روزرسانی state فقط یک بار در انتها
    setSlots(prev => ({ ...prev, ...newSlots }));
    setCardSlotMap(prev => ({ ...prev, ...newCardSlotMap }));
  },
  [cards, cardSlotMap, slots, getSlotPosition, unassignCardFromSlot]
);

  const frameCallback = useFrameCallback(() => {
    'worklet';
    const allCardIds = Object.keys(cards);
    
    // فقط کارت‌هایی که شناور هستند را برای فیزیک در نظر بگیرید
    const floatingCardIds = allCardIds.filter(id => {
      const card = cards[id];
      return card && !card.isDragging.value && !card.isAssigned.value;
    });

    const numCards = floatingCardIds.length;
    
    // مرحله ۱: به‌روزرسانی اولیه موقعیت و برخورد با دیوارها برای همه کارت‌های شناور
    for (let i = 0; i < numCards; i++) {
      const cardId = floatingCardIds[i];
      const card = cards[cardId];
      
      const pos = card.position.value;
      const velocity = card.velocity.value;

      if (isNaN(pos.x) || isNaN(pos.y) || isNaN(velocity.vx) || isNaN(velocity.vy)) {
        continue;
      }

      // محدود کردن سرعت
      const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
      if (speed > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / speed;
        velocity.vx *= scale;
        velocity.vy *= scale;
      } else if (speed < MIN_VELOCITY && speed > 0) {
        const scale = MIN_VELOCITY / speed;
        velocity.vx *= scale;
        velocity.vy *= scale;
      }

      // محاسبه موقعیت جدید بر اساس سرعت
      let newX = pos.x + velocity.vx * 0.016; // 0.016 for ~60fps
      let newY = pos.y + velocity.vy * 0.016;

      // برخورد با دیواره‌ها
      if (newX < 0) {
        newX = 0;
        velocity.vx *= -1;
      } else if (newX > BOUNDARY_WIDTH - CARD_SIZE_FLOATING) {
        newX = BOUNDARY_WIDTH - CARD_SIZE_FLOATING;
        velocity.vx *= -1;
      }
      if (newY < 0) {
        newY = 0;
        velocity.vy *= -1;
      } else if (newY > BOUNDARY_HEIGHT - CARD_SIZE_FLOATING) {
        newY = BOUNDARY_HEIGHT - CARD_SIZE_FLOATING;
        velocity.vy *= -1;
      }
      
      card.position.value = { x: newX, y: newY };
      card.velocity.value = velocity;
    }

    if (numCards < 2) { // اگر کمتر از ۲ کارت شناور داریم، نیازی به بررسی برخورد نیست
        return;
    }

    // مرحله ۲: بررسی برخورد کارت‌ها با یکدیگر و اعمال واکنش فیزیکی
    for (let i = 0; i < numCards; i++) {
      const cardA = cards[floatingCardIds[i]];

      for (let j = i + 1; j < numCards; j++) {
        const cardB = cards[floatingCardIds[j]];

        const posA = cardA.position.value;
        const velA = cardA.velocity.value;
        const posB = cardB.position.value;
        const velB = cardB.velocity.value;

        // تعریف مستطیل‌های کارت‌ها
        const rectA = { left: posA.x, right: posA.x + CARD_SIZE_FLOATING, top: posA.y, bottom: posA.y + CARD_SIZE_FLOATING };
        const rectB = { left: posB.x, right: posB.x + CARD_SIZE_FLOATING, top: posB.y, bottom: posB.y + CARD_SIZE_FLOATING };

        // بررسی همپوشانی مستطیل‌ها
        const isColliding =
          rectA.left < rectB.right &&
          rectA.right > rectB.left &&
          rectA.top < rectB.bottom &&
          rectA.bottom > rectB.top;

        if (isColliding) {
          // محاسبه مقدار همپوشانی
          const overlapX = Math.min(rectA.right - rectB.left, rectB.right - rectA.left);
          const overlapY = Math.min(rectA.bottom - rectB.top, rectB.bottom - rectA.top);

          // جابه‌جایی برای رفع همپوشانی
          let dx = 0;
          let dy = 0;
          if (overlapX < overlapY) {
            dx = rectA.left < rectB.left ? -(overlapX / 2) : overlapX / 2;
          } else {
            dy = rectA.top < rectB.top ? -(overlapY / 2) : overlapY / 2;
          }

          posA.x += dx;
          posA.y += dy;
          posB.x -= dx;
          posB.y -= dy;
          
          // محاسبه جهت برخورد (نرمال)
          const collisionNormalX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
          const collisionNormalY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

          // به‌روزرسانی سرعت‌ها (برخورد الاستیک)
          const relativeVx = velA.vx - velB.vx;
          const relativeVy = velA.vy - velB.vy;
          const dotProduct = relativeVx * collisionNormalX + relativeVy * collisionNormalY;

          if (dotProduct < 0) {
            const impulse = dotProduct; // Assuming mass of 1 for both
            velA.vx -= impulse * collisionNormalX;
            velA.vy -= impulse * collisionNormalY;
            velB.vx += impulse * collisionNormalX;
            velB.vy += impulse * collisionNormalY;
          }

          // به‌روزرسانی مقادیر در shared value ها
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
    };
  }, [frameCallback]);

  return (
    <DragDropContext.Provider
      value={{
        registerCard,
        getSlotPosition,
        assignCardToSlot,
        unassignCardFromSlot,
        getSlotOfCard,
        cards,
        slots,
        registerSlot,
        currentWords,
        completeCurrentPart,
        changePlayingIndex,
        currentPartIndex,
        playingPartIndex,
        completedSentences,
        numberOfCards,
        numberParts,
        lockedPan,
        type,
        stageId,
        applyForHelp
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => useContext(DragDropContext);