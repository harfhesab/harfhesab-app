import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useFrameCallback, SharedValue } from 'react-native-reanimated';
import {
    BOUNDARY_WIDTH,
    BOUNDARY_HEIGHT,
    CARD_SIZE_FLOATING,
    MAX_VELOCITY,
    MIN_VELOCITY,
} from "../constants/constants";

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
  isAssigned: SharedValue<boolean>;
  cardSize: SharedValue<number>;
  fontSize: SharedValue<number>;
}

interface ContextProps {
  registerCard: (card: Card) => void;
  getSlotPosition: (index: number) => Position | undefined;
  getSlotOfCard: (cardId: string) => number | null;
  cards: Record<string, Card>;
  slots: Record<number, string>;
  registerSlot: (index: number, pos: Position) => void;
  currentWords: any[];
}

const DragDropContext = createContext<ContextProps>({} as ContextProps);

export const OnboardingProvider: React.FC<{
  children: React.ReactNode;
  data: any;
}> = ({
  children,
  data
}) => {
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [slotPositions, setSlotPositions] = useState<Record<number, Position>>({});
  const [cardSlotMap, setCardSlotMap] = useState<Record<string, number>>({});

  const currentWords = data.map((w: any) => ({
    word: w.word,
    unknown_word: w.unknown_word,
    assigned: w.assigned
  })) || [];


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
        const dx = newPos.x + (CARD_SIZE_FLOATING*1.3) / 2 - (otherPos.x + (CARD_SIZE_FLOATING*1.3) / 2);
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
    [cards, isOverlapping]
  );

  const registerSlot = useCallback((index: number, pos: Position) => {
      setSlotPositions(prev => {
        return { ...prev, [index]: pos };
      });
    }, []);

  const frameCallback = useFrameCallback(() => {
    'worklet';
    const allCardIds = Object.keys(cards);
    
    // فقط کارت‌هایی که شناور هستند را برای فیزیک در نظر بگیرید
    const floatingCardIds = allCardIds.filter(id => {
      const card = cards[id];
      return card && !card.isAssigned.value;
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
      } else if (newX > BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3)) {
        newX = BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3);
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
        const rectA = { left: posA.x, right: posA.x + (CARD_SIZE_FLOATING*1.3), top: posA.y, bottom: posA.y + CARD_SIZE_FLOATING };
        const rectB = { left: posB.x, right: posB.x + (CARD_SIZE_FLOATING*1.3), top: posB.y, bottom: posB.y + CARD_SIZE_FLOATING };

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
        getSlotOfCard,
        cards,
        slots,
        registerSlot,
        currentWords,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => useContext(DragDropContext);