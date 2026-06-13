import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  CARD_SIZE_FLOATING,
  MAX_VELOCITY,
  MIN_VELOCITY,
} from '../constants/constants';

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
}

interface ContextProps {
  registerCard: (card: Card) => void;
  data: any;
  foundWords: {main: boolean; additional: any;};
}

const LettersContext = createContext<ContextProps>({} as ContextProps);


interface FoundWords {
  main: boolean;
  additional: Set<string>;
}

export const LettersProvider: React.FC<{
  children: React.ReactNode;
  data: any;
}> = ({ children, data }) => {
  const cardsRefArray = useRef<Card[]>([]);
  const cardsMapRef = useRef<Record<string, Card>>({});

  const foundWords:FoundWords = {
    main: data.word_builded || false,
    additional: new Set(data.additional_words_builded || []),
  };



  const registerCard = useCallback((card: Card) => {
    if (cardsMapRef.current[card.id]) return;
    cardsRefArray.current.push(card);
    cardsMapRef.current[card.id] = card;
  }, []);


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
    };
  }, [frameCallback]);


  return (
    <LettersContext.Provider
      value={{
        registerCard,
        data,
        foundWords
      }}
    >
      {children}
    </LettersContext.Provider>
  );
};

export const useLetters = () => useContext(LettersContext);