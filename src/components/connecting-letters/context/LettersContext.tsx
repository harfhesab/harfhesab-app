import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { useFrameCallback } from 'react-native-reanimated';
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
import { deselectCardSoundInLettersConnecting } from '../../../utils/sound/SoundFunctions';

interface Position { x: number; y: number; }
interface Velocity { vx: number; vy: number; }

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
  cards: Record<string, Card>;
  data: any;
  selectCard: (id: string) => void;
  connectedLetters: string[];
}

const LettersContext = createContext<ContextProps>({} as ContextProps);

export const LettersProvider: React.FC<{
  children: React.ReactNode;
  realm: Realm;
  data: any;
}> = ({ children, realm, data }) => {
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [connectedLetters, setConnectedLetters] = useState<string[]>([])
  // یک ref برای دسترسی بدون رندر به کارت‌ها (برای تایمر و select)
  const cardsRef = useRef<Record<string, Card>>({});
  const selectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerCard = useCallback((card: Card) => {
    // اگر کارت قبلاً ثبت شده بود از ثبت مجدد اجتناب کن
    if (cardsRef.current[card.id]) return;
    cardsRef.current = { ...cardsRef.current, [card.id]: card };
    setCards(prev => ({ ...prev, [card.id]: card }));
  }, []);

  const clearSelectionTimer = useCallback(() => {
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = null;
    }
  }, []);

  const deselectAll = useCallback(() => {
    setConnectedLetters([])
    const all = Object.values(cardsRef.current);
    for (const c of all) {
      try {
        if (c && c.selected && c.selected.value === 1) {
          c.selected.value = 0;
        }
      } catch (e) {
        // ایمن‌سازی در صورت خطا
      }
    }
    deselectCardSoundInLettersConnecting()
  }, []);

  const selectCard = useCallback((id: string) => {
    const card = cardsRef.current[id];
    if (!card) return;
    // فقط همان کارت را انتخاب کن (selected = 1)
    card.selected.value = 1;
    const newLetter = card.letter
    setConnectedLetters(prev => [...prev, newLetter]);
    // ریست/استارت تایمر مشترک
    clearSelectionTimer();
    selectionTimerRef.current = setTimeout(() => {
      // وقتی تایمر تمام شد، همه انتخاب‌ها را پاک کن
      deselectAll();
      selectionTimerRef.current = null;
    }, CARD_SELECTION_DURATION);
  }, [clearSelectionTimer, deselectAll]);

  // ---------- frameCallback: حرکت و برخورد ----------
  const frameCallback = useFrameCallback(() => {
    'worklet';
    const cardIds = Object.keys(cards);
    const numCards = cardIds.length;
    if (numCards === 0) return;

    // مرحله 1: حرکت و برخورد با دیواره‌ها (براساس card.cardSize.value)
    for (let i = 0; i < numCards; i++) {
      const card = cards[cardIds[i]];
      const pos = card.position.value;
      const vel = card.velocity.value;

      if (!pos || !vel) continue;

      // محدود کردن سرعت
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

      // dt تقریبی (یک فریم)
      const dt = 0.016; // تقریبی برای 60fps

      const size = card.cardSize.value ?? CARD_SIZE_FLOATING;
      let newX = pos.x + vel.vx * dt;
      let newY = pos.y + vel.vy * dt;

      if (newX < 0) {
        newX = 0;
        vel.vx *= -1;
      } else if (newX > BOUNDARY_WIDTH - size) {
        newX = BOUNDARY_WIDTH - size;
        vel.vx *= -1;
      }

      if (newY < 0) {
        newY = 0;
        vel.vy *= -1;
      } else if (newY > BOUNDARY_HEIGHT - size) {
        newY = BOUNDARY_HEIGHT - size;
        vel.vy *= -1;
      }

      card.position.value = { x: newX, y: newY };
      card.velocity.value = { vx: vel.vx, vy: vel.vy };
    }

    // مرحله 2: برخورد کارت‌ها (فقط اگر هر دو هم‌وضعیت selected باشند)
    for (let i = 0; i < numCards; i++) {
      const cardA = cards[cardIds[i]];

      for (let j = i + 1; j < numCards; j++) {
        const cardB = cards[cardIds[j]];

        // اگر وضعیت selected متفاوت است → برخورد نکنند
        // (اگر هر دو 0 باشند برخورد دارند، اگر هر دو 1 باشند نیز برخورد دارند)
        try {
          if (cardA.selected.value !== cardB.selected.value) {
            continue;
          }
        } catch (e) {
          // اگر sharedvalue در دسترس نبود، از برخورد صرف‌نظر کن
          continue;
        }

        const posA = cardA.position.value;
        const posB = cardB.position.value;
        const sizeA = cardA.cardSize.value ?? CARD_SIZE_FLOATING;
        const sizeB = cardB.cardSize.value ?? CARD_SIZE_FLOATING;

        // بررسی همپوشانی مستطیلی (AABB)
        const cardRect = { left: posA.x, right: posA.x + sizeA, top: posA.y, bottom: posA.y + sizeA };
        const otherRect = { left: posB.x, right: posB.x + sizeB, top: posB.y, bottom: posB.y + sizeB };

        const isColliding =
          cardRect.left < otherRect.right &&
          cardRect.right > otherRect.left &&
          cardRect.top < otherRect.bottom &&
          cardRect.bottom > otherRect.top;

        if (!isColliding) continue;

        // محاسبه مقدار همپوشانی در محورهای x و y
        const overlapX = Math.min(cardRect.right - otherRect.left, otherRect.right - cardRect.left);
        const overlapY = Math.min(cardRect.bottom - otherRect.top, otherRect.bottom - cardRect.top);

        // رفع همپوشانی
        let dx = 0;
        let dy = 0;
        if (overlapX < overlapY) {
          dx = cardRect.left < otherRect.left ? -overlapX / 2 : overlapX / 2;
        } else {
          dy = cardRect.top < otherRect.top ? -overlapY / 2 : overlapY / 2;
        }

        posA.x += dx;
        posA.y += dy;
        posB.x -= dx;
        posB.y -= dy;

        // محاسبه نرمال
        const nx = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
        const ny = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

        const velA = cardA.velocity.value;
        const velB = cardB.velocity.value;

        const relativeVx = velA.vx - velB.vx;
        const relativeVy = velA.vy - velB.vy;
        const dot = relativeVx * nx + relativeVy * ny;

        if (dot < 0) {
          const impulse = (2 * dot) / 2; // جرم‌ها را 1 در نظر می‌گیریم
          velA.vx -= impulse * nx;
          velA.vy -= impulse * ny;
          velB.vx += impulse * nx;
          velB.vy += impulse * ny;
        }

        // بروزرسانی shared value ها
        cardA.position.value = { x: posA.x, y: posA.y };
        cardB.position.value = { x: posB.x, y: posB.y };
        cardA.velocity.value = { vx: velA.vx, vy: velA.vy };
        cardB.velocity.value = { vx: velB.vx, vy: velB.vy };
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
        cards,
        data,
        selectCard,
        connectedLetters
      }}
    >
      {children}
    </LettersContext.Provider>
  );
};

export const useLetters = () => useContext(LettersContext);
