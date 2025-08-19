import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, { useFrameCallback, withSpring, SharedValue } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';
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
import AlertHelper from '../../alert/AlertHelper';
import { goBack } from '../../../main/navigationService';
import { complatedOneStageInStageGmae } from '../functions/StageGameOperation';

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
}

const DragDropContext = createContext<ContextProps>({} as ContextProps);

export const DragDropProvider: React.FC<{ children: React.ReactNode, parts: Realm.List<any> | any[], stageNumber: number | undefined, realm: Realm, stageId: string, type: string }> = ({ children, parts, stageNumber, realm, stageId, type }) => {
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [slotPositions, setSlotPositions] = useState<Record<number, Position>>({});
  const [cardSlotMap, setCardSlotMap] = useState<Record<string, number>>({});
  const [currentPartIndex, setCurrentPartIndex] = useState(parts.findIndex((item) => item.sentence_builded !== true));
  const [playingPartIndex, setPlayingPartIndex] = useState(parts.findIndex((item) => item.sentence_builded !== true))
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [lockedPan, setLockedPan] = useState<boolean>(false)
  const numberParts = parts.length


  const currentWords = parts[playingPartIndex]?.words.map((w: any) => ({
    _id: w._id,
    word: w.word,
    unknown_word: w.unknown_word,
    unknown_word_completed: w.unknown_word_completed,
  })) || [];

  const numberOfCards = currentWords.length;

  const completeCurrentPart = useCallback(() => {
    if(playingPartIndex == currentPartIndex){
      const currentSentence = parts[playingPartIndex].sentence;
      setCompletedSentences(prev => {
        if (!prev.includes(currentSentence)) {
          return [...prev, currentSentence];
        }
        return prev;
      });
    }
    setLockedPan(true)
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
        setSlotPositions({})
        setCardSlotMap({})
        setLockedPan(false)
      }, 1000)
    } else {
      setTimeout(()=>{
        setSlots({})
      }, 1000)
      setTimeout(()=>{
        setLockedPan(false)
        if(type == "stage-game"){
          complatedOneStageInStageGmae()
        } else if(type == "package-game"){
          
        }
      }, 2000)
      console.log('Stage completed');
    }
  }, [currentPartIndex, playingPartIndex, parts]);

  const changePlayingIndex = useCallback((index: number) => {
    setPlayingPartIndex(index)
    setSlots({})
    setCards({})
    setSlotPositions({})
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
    Object.keys(cards).forEach(cardId => {
      const card = cards[cardId];
      if (!card || card.isDragging.value || card.isAssigned.value) return;

      const pos = card.position.value;
      const velocity = card.velocity.value;

      if (isNaN(pos.x) || isNaN(pos.y) || isNaN(velocity.vx) || isNaN(velocity.vy)) {
        return;
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
      let newX = pos.x + velocity.vx * 0.012;
      let newY = pos.y + velocity.vy * 0.012;

      // برخورد با دیواره‌ها
      if (newX < 0) {
        newX = 0;
        velocity.vx = -velocity.vx;
      } else if (newX > BOUNDARY_WIDTH - CARD_SIZE_FLOATING) {
        newX = BOUNDARY_WIDTH - CARD_SIZE_FLOATING;
        velocity.vx = -velocity.vx;
      }
      if (newY < 0) {
        newY = 0;
        velocity.vy = -velocity.vy;
      } else if (newY > BOUNDARY_HEIGHT - CARD_SIZE_FLOATING) {
        newY = BOUNDARY_HEIGHT - CARD_SIZE_FLOATING;
        velocity.vy = -velocity.vy;
      }

      // برخورد مستطیلی با کارت‌های دیگر
      Object.keys(cards).forEach(otherCardId => {
        if (otherCardId === cardId || cards[otherCardId].isDragging.value || cards[otherCardId].isAssigned.value) return;
        const otherPos = cards[otherCardId].position.value;
        const otherVel = cards[otherCardId].velocity.value;
        if (!otherPos || !otherVel) return;

        // تعریف مستطیل‌های کارت‌ها
        const cardRect = {
          left: newX,
          right: newX + CARD_SIZE_FLOATING,
          top: newY,
          bottom: newY + CARD_SIZE_FLOATING,
        };
        const otherRect = {
          left: otherPos.x,
          right: otherPos.x + CARD_SIZE_FLOATING,
          top: otherPos.y,
          bottom: otherPos.y + CARD_SIZE_FLOATING,
        };

        // بررسی همپوشانی مستطیل‌ها
        const isColliding =
          cardRect.left < otherRect.right &&
          cardRect.right > otherRect.left &&
          cardRect.top < otherRect.bottom &&
          cardRect.bottom > otherRect.top;

        if (isColliding) {
          // محاسبه مقدار همپوشانی در محورهای x و y
          const overlapX = Math.min(cardRect.right - otherRect.left, otherRect.right - cardRect.left);
          const overlapY = Math.min(cardRect.bottom - otherRect.top, otherRect.bottom - cardRect.top);

          // پیدا کردن محور با کمترین همپوشانی برای جابه‌جایی
          let dx = 0;
          let dy = 0;
          if (overlapX < overlapY) {
            // جابه‌جایی در محور x
            if (cardRect.left < otherRect.left) {
              dx = -(overlapX / 2);
            } else {
              dx = overlapX / 2;
            }
          } else {
            // جابه‌جایی در محور y
            if (cardRect.top < otherRect.top) {
              dy = -(overlapY / 2);
            } else {
              dy = overlapY / 2;
            }
          }

          // محاسبه جهت برخورد
          const collisionNormalX = dx !== 0 ? dx / Math.abs(dx) : 0;
          const collisionNormalY = dy !== 0 ? dy / Math.abs(dy) : 0;

          // به‌روزرسانی سرعت‌ها (برخورد الاستیک)
          const relativeVx = velocity.vx - otherVel.vx;
          const relativeVy = velocity.vy - otherVel.vy;
          const dotProduct = relativeVx * collisionNormalX + relativeVy * collisionNormalY;

          if (dotProduct < 0) {
            // فقط اگر کارت‌ها به سمت هم حرکت می‌کنن، سرعت رو تغییر بده
            velocity.vx -= dotProduct * collisionNormalX;
            velocity.vy -= dotProduct * collisionNormalY;
            otherVel.vx += dotProduct * collisionNormalX;
            otherVel.vy += dotProduct * collisionNormalY;
          }

          // جابه‌جایی کارت‌ها برای رفع همپوشانی
          newX += dx;
          newY += dy;
          otherPos.x -= dx;
          otherPos.y -= dy;

          cards[otherCardId].position.value = { x: otherPos.x, y: otherPos.y };
          cards[otherCardId].velocity.value = { vx: otherVel.vx, vy: otherVel.vy };
        }
      });

      card.position.value = { x: newX, y: newY };
      card.velocity.value = { vx: velocity.vx, vy: velocity.vy };
    });
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
        lockedPan
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => useContext(DragDropContext);