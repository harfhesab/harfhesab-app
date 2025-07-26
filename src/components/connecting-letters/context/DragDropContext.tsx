import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Animated, { useFrameCallback, withSpring } from 'react-native-reanimated';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  CARD_SIZE_FLOATING,
  CARD_SIZE_DRAGGING,
  CARD_SIZE_ATTACHED,
  FONT_SIZE_FLOATING,
  FONT_SIZE_ATTACHED,
  MAX_VELOCITY,
  MIN_VELOCITY,
  ATTACH_OFFSET_X,
  ATTACH_OFFSET_Y,
  SPRING_CONFIG_MAGNET,
} from '../constants/constants';

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
  letter: string;
  homePosition: Position;
  position: Animated.SharedValue<Position>;
  velocity: Animated.SharedValue<Velocity>;
  isDragging: Animated.SharedValue<boolean>;
  isAttached: Animated.SharedValue<boolean>;
  cardSize: Animated.SharedValue<number>;
  fontSize: Animated.SharedValue<number>;
  attachedTo: Animated.SharedValue<string | null>;
  attachIndex: Animated.SharedValue<number>;
}

interface ContextProps {
  registerCard: (card: Card) => void;
  attachCard: (cardId: string, targetId: string, isDraggingCard?: boolean) => void;
  detachCards: (cardId: string) => void;
  checkWord: (draggedCardId: string) => void;
  startDragging: (cardId: string) => void;
  cards: Record<string, Card>;
  word: string[];
  draggedCardId: string | null;
}

const DragDropContext = createContext<ContextProps>({} as ContextProps);

export const DragDropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [word, setWord] = useState<string[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const isOverlapping = useCallback(
    (newPos: Position, cardId: string) => {
      'worklet';
      for (const otherCardId in cards) {
        if (otherCardId === cardId || cards[otherCardId].isAttached.value || cards[otherCardId].isDragging.value) continue;
        const otherPos = cards[otherCardId].position.value;
        if (!otherPos) continue;
        const dx = newPos.x + CARD_SIZE_FLOATING / 2 - (otherPos.x + CARD_SIZE_FLOATING / 2);
        const dy = newPos.y + CARD_SIZE_FLOATING / 2 - (otherPos.y + CARD_SIZE_FLOATING / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CARD_SIZE_FLOATING) return true;
      }
      return false;
    },
    [cards]
  );

  const registerCard = useCallback(
    (card: Card) => {
      if (cards[card.id]) return;
      setCards((prev) => ({ ...prev, [card.id]: card }));

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

  const startDragging = useCallback(
    (cardId: string) => {
      const card = cards[cardId];
      if (!card) return;
      setWord([card.letter]);
      setDraggedCardId(cardId);
    },
    [cards]
  );

  const attachCard = useCallback(
    (cardId: string, targetId: string, isDraggingCard = false) => {
      const card = cards[cardId];
      const target = cards[targetId];
      if (!card || !target || (card.isAttached.value && !isDraggingCard) || cardId === targetId) return;

      if (isDraggingCard) {
        // For the dragged card, initialize it as the root card
        card.isDragging.value = true;
        card.isAttached.value = false;
        card.attachedTo.value = null;
        card.attachIndex.value = 0;
        card.cardSize.value = withSpring(CARD_SIZE_DRAGGING, SPRING_CONFIG_MAGNET);
        card.fontSize.value = withSpring(FONT_SIZE_ATTACHED, SPRING_CONFIG_MAGNET);
      } else {
        // For attached cards
        card.isAttached.value = true;
        card.attachedTo.value = targetId;
        card.cardSize.value = withSpring(CARD_SIZE_ATTACHED, SPRING_CONFIG_MAGNET);
        card.fontSize.value = withSpring(FONT_SIZE_ATTACHED, SPRING_CONFIG_MAGNET);

        // Calculate attach index
        let attachIndex = 0;
        const attachedCards = Object.values(cards).filter(
          (c) => c.attachedTo.value === targetId && c.id !== cardId
        );
        if (attachedCards.length > 0) {
          attachIndex = Math.max(...attachedCards.map((c) => c.attachIndex.value)) + 1;
        }
        card.attachIndex.value = attachIndex;

        // Append the attached card's letter to the word
        setWord((prev) => {
          const draggedCard = draggedCardId ? cards[draggedCardId] : null;
          const baseWord = draggedCard ? [draggedCard.letter] : prev;
          return [...baseWord, ...prev.slice(baseWord.length), card.letter];
        });
      }
    },
    [cards, draggedCardId]
  );

  const detachCards = useCallback(
    (cardId: string) => {
      const allAttachedCards: string[] = [];
      const collectAttached = (id: string) => {
        Object.keys(cards).forEach((otherId) => {
          if (cards[otherId].attachedTo.value === id) {
            allAttachedCards.push(otherId);
            collectAttached(otherId);
          }
        });
      };
      collectAttached(cardId);

      const draggedCard = cards[cardId];
      if (draggedCard) {
        draggedCard.isDragging.value = false;
        draggedCard.isAttached.value = false;
        draggedCard.attachedTo.value = null;
        draggedCard.attachIndex.value = 0;
        draggedCard.cardSize.value = withSpring(CARD_SIZE_FLOATING, SPRING_CONFIG_MAGNET);
        draggedCard.fontSize.value = withSpring(FONT_SIZE_FLOATING, SPRING_CONFIG_MAGNET);
        let newPos = {
          x: Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING),
          y: Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
        };
        let attempts = 0;
        while (isOverlapping(newPos, cardId) && attempts < 100) {
          newPos = {
            x: Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING),
            y: Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
          };
          attempts++;
        }
        draggedCard.position.value = withSpring(newPos, SPRING_CONFIG_MAGNET);
        draggedCard.velocity.value = {
          vx: (Math.random() - 0.5) * MAX_VELOCITY,
          vy: (Math.random() - 0.5) * MAX_VELOCITY,
        };
      }

      allAttachedCards.forEach((id) => {
        const card = cards[id];
        card.isAttached.value = false;
        card.attachedTo.value = null;
        card.attachIndex.value = 0;
        card.cardSize.value = withSpring(CARD_SIZE_FLOATING, SPRING_CONFIG_MAGNET);
        card.fontSize.value = withSpring(FONT_SIZE_FLOATING, SPRING_CONFIG_MAGNET);
        let newPos = {
          x: Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING),
          y: Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
        };
        let attempts = 0;
        while (isOverlapping(newPos, id) && attempts < 100) {
          newPos = {
            x: Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING),
            y: Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
          };
          attempts++;
        }
        card.position.value = withSpring(newPos, SPRING_CONFIG_MAGNET);
        card.velocity.value = {
          vx: (Math.random() - 0.5) * MAX_VELOCITY,
          vy: (Math.random() - 0.5) * MAX_VELOCITY,
        };
      });

      // Clear word and draggedCardId
      setWord([]);
      setDraggedCardId(null);
    },
    [cards, isOverlapping]
  );

  const checkWord = useCallback(
    (draggedCardId: string) => {
      const currentWord = word.join('');
      const validWords = ['سلام', 'ملاس', 'لامس'];

      if (word.length >= 4 && validWords.includes(currentWord)) {
        console.log('Success: کلمه درست است!');
        // Remove used cards and add new ones
        const newCards = { ...cards };
        const allAttachedCards: string[] = [draggedCardId];
        const collectAttached = (id: string) => {
          Object.keys(cards).forEach((otherId) => {
            if (cards[otherId].attachedTo.value === id) {
              allAttachedCards.push(otherId);
              collectAttached(otherId);
            }
          });
        };
        collectAttached(draggedCardId);
        allAttachedCards.forEach((id) => {
          delete newCards[id];
        });
        setCards(newCards);
        setWord([]);
        setDraggedCardId(null);
        // Add new cards
        const newLetters = ['س', 'ل', 'ا', 'م'];
        newLetters.forEach((letter, index) => {
          const id = `${letter}_${index}_${Date.now()}`;
          const initialX = Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING);
          const initialY = Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING);
          registerCard({
            id,
            letter,
            homePosition: { x: initialX, y: initialY },
            position: useSharedValue({ x: initialX, y: initialY }),
            velocity: useSharedValue({
              vx: (Math.random() - 0.5) * MAX_VELOCITY,
              vy: (Math.random() - 0.5) * MAX_VELOCITY,
            }),
            isDragging: useSharedValue(false),
            isAttached: useSharedValue(false),
            cardSize: useSharedValue(CARD_SIZE_FLOATING),
            fontSize: useSharedValue(FONT_SIZE_FLOATING),
            attachedTo: useSharedValue(null),
            attachIndex: useSharedValue(0),
          });
        });
      } else {
        console.log('Error: کلمه نادرست است یا ناقص');
        detachCards(draggedCardId);
      }
    },
    [cards, word, detachCards, registerCard]
  );

  const frameCallback = useFrameCallback(() => {
    'worklet';
    Object.keys(cards).forEach((cardId) => {
      const card = cards[cardId];
      if (!card || card.isDragging.value || card.isAttached.value) return;

      const pos = card.position.value;
      const velocity = card.velocity.value;

      if (isNaN(pos.x) || isNaN(pos.y) || isNaN(velocity.vx) || isNaN(velocity.vy)) {
        return;
      }

      // Speed limiting
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

      // Update position based on velocity
      let newX = pos.x + velocity.vx * 0.012;
      let newY = pos.y + velocity.vy * 0.012;

      // Boundary collision
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

      // Card-to-card collision
      Object.keys(cards).forEach((otherCardId) => {
        if (otherCardId === cardId || cards[otherCardId].isDragging.value || cards[otherCardId].isAttached.value) return;
        const otherPos = cards[otherCardId].position.value;
        const otherVel = cards[otherCardId].velocity.value;
        if (!otherPos || !otherVel) return;

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

        const isColliding =
          cardRect.left < otherRect.right &&
          cardRect.right > otherRect.left &&
          cardRect.top < otherRect.bottom &&
          cardRect.bottom > otherRect.top;

        if (isColliding) {
          const overlapX = Math.min(cardRect.right - otherRect.left, otherRect.right - cardRect.left);
          const overlapY = Math.min(cardRect.bottom - otherRect.top, otherRect.bottom - cardRect.top);

          let dx = 0;
          let dy = 0;
          if (overlapX < overlapY) {
            if (cardRect.left < otherRect.left) {
              dx = -overlapX / 2;
            } else {
              dx = overlapX / 2;
            }
          } else {
            if (cardRect.top < otherRect.top) {
              dy = -overlapY / 2;
            } else {
              dy = overlapY / 2;
            }
          }

          const collisionNormalX = dx !== 0 ? dx / Math.abs(dx) : 0;
          const collisionNormalY = dy !== 0 ? dy / Math.abs(dy) : 0;

          const relativeVx = velocity.vx - otherVel.vx;
          const relativeVy = velocity.vy - otherVel.vy;
          const dotProduct = relativeVx * collisionNormalX + relativeVy * collisionNormalY;

          if (dotProduct < 0) {
            velocity.vx -= dotProduct * collisionNormalX;
            velocity.vy -= dotProduct * collisionNormalY;
            otherVel.vx += dotProduct * collisionNormalX;
            otherVel.vy += dotProduct * collisionNormalY;
          }

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

    // Update positions of attached cards
    Object.keys(cards).forEach((cardId) => {
      const card = cards[cardId];
      if (!card.isAttached.value || !card.attachedTo.value) return;

      const target = cards[card.attachedTo.value];
      if (!target) return;

      const targetPos = target.position.value;
      card.position.value = withSpring(
        {
          x: targetPos.x + card.attachIndex.value * ATTACH_OFFSET_X,
          y: targetPos.y + card.attachIndex.value * ATTACH_OFFSET_Y,
        },
        SPRING_CONFIG_MAGNET
      );
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
        attachCard,
        detachCards,
        checkWord,
        startDragging,
        cards,
        word,
        draggedCardId,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => useContext(DragDropContext);